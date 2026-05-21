import StoreKit
import Foundation

// MARK: - Errors

enum IAPError: LocalizedError {
    case productNotFound
    case userCancelled
    case pending
    case failedVerification
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .productNotFound:      return "Product not found in App Store"
        case .userCancelled:        return "Purchase cancelled"
        case .pending:              return "Purchase is pending approval"
        case .failedVerification:   return "Transaction verification failed"
        case .unknown(let msg):     return msg
        }
    }
}

// MARK: - IAPManager (StoreKit 2)

final class IAPManager {

    static let proProductIds: Set<String> = [
        "com.watchsnap.app.pro.monthly",
        "com.watchsnap.app.pro.annual"
    ]

    // ── Fetch product info ──────────────────────────────────────────
    func fetchProducts(ids: Set<String>) async throws -> [Product] {
        try await Product.products(for: ids)
    }

    // ── Initiate a purchase ─────────────────────────────────────────
    func purchase(productId: String) async throws -> UInt64 {
        let products = try await Product.products(for: [productId])
        guard let product = products.first else { throw IAPError.productNotFound }

        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            return transaction.id
        case .userCancelled:
            throw IAPError.userCancelled
        case .pending:
            throw IAPError.pending
        @unknown default:
            throw IAPError.unknown("Unexpected purchase result")
        }
    }

    // ── Restore purchases ───────────────────────────────────────────
    func restorePurchases() async throws -> Bool {
        try await AppStore.sync()

        var restored = false
        for await result in Transaction.currentEntitlements {
            if case .verified(let tx) = result,
               IAPManager.proProductIds.contains(tx.productID) {
                await tx.finish()
                restored = true
            }
        }
        return restored
    }

    // ── Check current entitlements ──────────────────────────────────
    func checkEntitlements() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let tx) = result,
               IAPManager.proProductIds.contains(tx.productID) {
                return true
            }
        }
        return false
    }

    // ── StoreKit verification helper ────────────────────────────────
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified: throw IAPError.failedVerification
        case .verified(let value): return value
        }
    }
}

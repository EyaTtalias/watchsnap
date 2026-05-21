import Capacitor
import Foundation

// MARK: - IAPPlugin
// Custom Capacitor 8 plugin that exposes StoreKit 2 to the web layer.
// JS name: "IAP"  —  import via registerPlugin<IAPPlugin>("IAP") in TypeScript.

@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier   = "IAPPlugin"
    public let jsName       = "IAP"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts",       returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchaseProduct",   returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases",  returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkEntitlements", returnType: CAPPluginReturnPromise),
    ]

    private lazy var manager = IAPManager()

    // ── getProducts({ productIds: string[] }) ───────────────────────
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let ids = call.getArray("productIds", String.self), !ids.isEmpty else {
            call.reject("productIds array is required")
            return
        }
        Task { @MainActor in
            do {
                let products = try await self.manager.fetchProducts(ids: Set(ids))
                let mapped: [[String: Any]] = products.map { p in
                    return [
                        "productId":   p.id,
                        "title":       p.displayName,
                        "description": p.description,
                        "price":       p.displayPrice,
                    ]
                }
                call.resolve(["products": mapped])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    // ── purchaseProduct({ productId: string }) ──────────────────────
    @objc func purchaseProduct(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task { @MainActor in
            do {
                let txId = try await self.manager.purchase(productId: productId)
                call.resolve([
                    "transactionId": String(txId),
                    "productId":     productId,
                ])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    // ── restorePurchases() ──────────────────────────────────────────
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task { @MainActor in
            do {
                let restored = try await self.manager.restorePurchases()
                call.resolve(["restored": restored])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    // ── checkEntitlements() ─────────────────────────────────────────
    @objc func checkEntitlements(_ call: CAPPluginCall) {
        Task { @MainActor in
            let isPro = await self.manager.checkEntitlements()
            call.resolve(["isPro": isPro])
        }
    }
}

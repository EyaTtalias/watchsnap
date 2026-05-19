import UIKit
import Capacitor

// MARK: - ViewController
// Subclass of CAPBridgeViewController referenced by Main.storyboard.
// The override below fixes a hard crash on iPad where UIKit requires every
// popover to have a non-nil sourceView/barButtonItem before presentation.
// Capacitor's file-input / PHPickerViewController path omits this on iPad,
// causing:  "UIPopoverPresentationController … must have a non-nil sourceView"
class ViewController: CAPBridgeViewController {

    override func present(
        _ viewControllerToPresent: UIViewController,
        animated flag: Bool,
        completion: (() -> Void)? = nil
    ) {
        // Only fix popovers that have no anchor — let everything else pass through.
        if UIDevice.current.userInterfaceIdiom == .pad,
           let popover = viewControllerToPresent.popoverPresentationController,
           popover.sourceView == nil,
           popover.barButtonItem == nil
        {
            popover.sourceView = self.view
            // Anchor near the bottom-centre of the screen (natural thumb reach).
            popover.sourceRect = CGRect(
                x: self.view.bounds.midX,
                y: self.view.bounds.maxY - 120,
                width: 1, height: 1
            )
            popover.permittedArrowDirections = []
        }
        super.present(viewControllerToPresent, animated: flag, completion: completion)
    }
}

// MARK: - AppDelegate
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

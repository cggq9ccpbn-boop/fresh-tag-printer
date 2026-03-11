#import <Capacitor/Capacitor.h>

CAP_PLUGIN(TcpPrinterPlugin, "TcpPrinter",
    CAP_PLUGIN_METHOD(print, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(testConnection, CAPPluginReturnPromise);
)

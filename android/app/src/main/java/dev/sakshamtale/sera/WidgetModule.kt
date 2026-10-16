package dev.sakshamtale.sera

import com.facebook.react.bridge.*

class WidgetModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetModule"

    @ReactMethod
    fun updateAllWidgets(data: ReadableMap, promise: Promise) {
        try {
            SeraWidgetData.saveWidgetData(reactContext, data)

            SeraQuickActionWidgetProvider.updateAll(reactContext)
            SeraBudgetWidgetProvider.updateAll(reactContext)
            SeraNetWorthWidgetProvider.updateAll(reactContext)
            SeraGoalWidgetProvider.updateAll(reactContext)
            SeraDashboardWidgetProvider.updateAll(reactContext)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WIDGET_ERROR", e.message, e)
        }
    }
}

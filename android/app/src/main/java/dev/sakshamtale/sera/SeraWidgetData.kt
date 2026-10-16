package dev.sakshamtale.sera

import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReadableMap
import org.json.JSONObject

object SeraWidgetData {
    private const val PREFS_NAME = "sera_widget_prefs"
    private const val KEY_WIDGET_DATA = "widget_json_data"

    fun saveWidgetData(context: Context, data: ReadableMap) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = JSONObject()

        if (data.hasKey("currencySymbol")) json.put("currencySymbol", data.getString("currencySymbol"))
        if (data.hasKey("todaySpent")) json.put("todaySpent", data.getString("todaySpent"))
        if (data.hasKey("netWorth")) json.put("netWorth", data.getString("netWorth"))
        if (data.hasKey("budgetRemaining")) json.put("budgetRemaining", data.getString("budgetRemaining"))
        if (data.hasKey("budgetTotal")) json.put("budgetTotal", data.getString("budgetTotal"))
        if (data.hasKey("budgetProgress")) json.put("budgetProgress", data.getInt("budgetProgress"))
        if (data.hasKey("dailySafeSpend")) json.put("dailySafeSpend", data.getString("dailySafeSpend"))
        if (data.hasKey("monthSpent")) json.put("monthSpent", data.getString("monthSpent"))

        if (data.hasKey("acc1Name")) json.put("acc1Name", data.getString("acc1Name"))
        if (data.hasKey("acc1Bal")) json.put("acc1Bal", data.getString("acc1Bal"))
        if (data.hasKey("acc2Name")) json.put("acc2Name", data.getString("acc2Name"))
        if (data.hasKey("acc2Bal")) json.put("acc2Bal", data.getString("acc2Bal"))

        if (data.hasKey("goalTitle")) json.put("goalTitle", data.getString("goalTitle"))
        if (data.hasKey("goalAmounts")) json.put("goalAmounts", data.getString("goalAmounts"))
        if (data.hasKey("goalPercent")) json.put("goalPercent", data.getInt("goalPercent"))

        if (data.hasKey("tx1Name")) json.put("tx1Name", data.getString("tx1Name"))
        if (data.hasKey("tx1Amt")) json.put("tx1Amt", data.getString("tx1Amt"))
        if (data.hasKey("tx2Name")) json.put("tx2Name", data.getString("tx2Name"))
        if (data.hasKey("tx2Amt")) json.put("tx2Amt", data.getString("tx2Amt"))

        if (data.hasKey("todaySpentVal")) json.put("todaySpentVal", data.getString("todaySpentVal"))
        if (data.hasKey("dailySafeVal")) json.put("dailySafeVal", data.getString("dailySafeVal"))
        if (data.hasKey("goalRemaining")) json.put("goalRemaining", data.getString("goalRemaining"))

        if (data.hasKey("subMonthlyTotal")) json.put("subMonthlyTotal", data.getString("subMonthlyTotal"))
        if (data.hasKey("subCount")) json.put("subCount", data.getString("subCount"))
        if (data.hasKey("subNextName")) json.put("subNextName", data.getString("subNextName"))
        if (data.hasKey("subNextDate")) json.put("subNextDate", data.getString("subNextDate"))
        if (data.hasKey("subNextAmt")) json.put("subNextAmt", data.getString("subNextAmt"))

        prefs.edit().putString(KEY_WIDGET_DATA, json.toString()).apply()
    }

    fun getWidgetData(context: Context): JSONObject {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val jsonStr = prefs.getString(KEY_WIDGET_DATA, null)
        return if (jsonStr != null) {
            try {
                JSONObject(jsonStr)
            } catch (e: Exception) {
                JSONObject()
            }
        } else {
            JSONObject()
        }
    }
}

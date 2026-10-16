package dev.sakshamtale.sera

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import androidx.core.app.NotificationCompat

class NotificationReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action

        if (Intent.ACTION_BOOT_COMPLETED == action) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val isEnabled = prefs.getBoolean(KEY_REMINDER_ENABLED, false)
            if (isEnabled) {
                val hour = prefs.getInt(KEY_REMINDER_HOUR, 20)
                val minute = prefs.getInt(KEY_REMINDER_MINUTE, 0)
                NotificationModule.scheduleReminderInternal(context, hour, minute)
            }
            return
        }

        val title = intent.getStringExtra(EXTRA_TITLE) ?: "SERA • Daily Expense Reminder"
        val message = intent.getStringExtra(EXTRA_MESSAGE)
            ?: "Take 30 seconds to record today's spending and keep your budget intentional."
        val channelId = intent.getStringExtra(EXTRA_CHANNEL_ID) ?: NotificationModule.CHANNEL_REMINDERS
        val notificationId = intent.getIntExtra(EXTRA_ID, 1001)

        val tapIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val largeIcon = try {
            BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher_round)
        } catch (e: Exception) {
            null
        }

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher_round)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setSubText("SERA")
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        if (largeIcon != null) {
            builder.setLargeIcon(largeIcon)
        }

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notificationId, builder.build())

        // Re-arm next day's alarm
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isEnabled = prefs.getBoolean(KEY_REMINDER_ENABLED, false)
        if (isEnabled) {
            val hour = prefs.getInt(KEY_REMINDER_HOUR, 20)
            val minute = prefs.getInt(KEY_REMINDER_MINUTE, 0)
            NotificationModule.scheduleReminderInternal(context, hour, minute)
        }
    }

    companion object {
        const val PREFS_NAME = "sera_notifications"
        const val KEY_REMINDER_ENABLED = "reminder_enabled"
        const val KEY_REMINDER_HOUR = "reminder_hour"
        const val KEY_REMINDER_MINUTE = "reminder_minute"

        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_MESSAGE = "extra_message"
        const val EXTRA_CHANNEL_ID = "extra_channel_id"
        const val EXTRA_ID = "extra_id"
        const val ACTION_ALARM = "dev.sakshamtale.sera.ACTION_NOTIFICATION"
    }
}

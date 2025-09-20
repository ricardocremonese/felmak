package br.com.vw.uptime.schedule.core.utils

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.reflect.TypeToken

class Json2Object {

    companion object {

        inline fun <reified T> toObject(json:String) : T {
            val type = object : TypeToken<T>() {}.type
            return Gson().fromJson(json, type)
        }

        inline fun <reified T> toObjectFromAttribute(json:String, attrName:String) : T {
            val gson = Gson()
            val jsonObject = gson.fromJson(json, JsonObject::class.java)
            val jsonElement = jsonObject.get(attrName)
            val type = object : TypeToken<T>() {}.type
            return gson.fromJson(jsonElement, type)
        }
    }

}
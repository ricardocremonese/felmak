package br.com.vw.uptime.schedule.infrastructure.cache

import java.util.concurrent.ConcurrentHashMap


abstract class CacheComponent<K, V> {
    private val cache: ConcurrentHashMap<K, V> = ConcurrentHashMap()

    protected fun get(key: K): V? = cache.get(key)

    protected fun put(key: K, value: V) = cache.putIfAbsent(key, value)
}
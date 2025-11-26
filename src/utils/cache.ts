import { OrcidProvider } from '../orcid/orcid-providers/orcid-provider.abstract.js'

type Constructor<T> = new (...args: any[]) => T

export function CacheableOrcidProvider<
  TBase extends Constructor<OrcidProvider>
>(Base: TBase) {
  class CacheableMixin extends Base {
    #cache: Map<string, string> = new Map<string, string>()

    getCache(key: string): string | undefined {
      return this.#cache.get(key)
    }

    setCache(key: string, value: string): void {
      this.#cache.set(key, value)
    }

    cacheHas(key: string): boolean {
      return this.#cache.has(key)
    }
  }
  return CacheableMixin
}

// export abstract class Cacheable<ValueType = string> {}

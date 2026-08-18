export interface ModuleItem<T = any> {
  name: string
  src: T
}

export async function loadModules<T = string>(
  modules: Record<string, () => Promise<any>>,
): Promise<{ name: string, src: T }[]> {
  const result = await Promise.all(
    Object.entries(modules).map(async ([key, loader]) => {
      const mod = await loader()
      return {
        name: key.split('/').pop()!,
        src: mod.src,
      }
    }),
  )
  return result
}

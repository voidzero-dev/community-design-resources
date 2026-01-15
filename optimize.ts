import fs from 'node:fs'
import { optimize } from 'svgo'

optimizeBrandAssets()

function optimizeBrandAssets() {
  const files = getAllFiles('brand-assets')
  const maxFileNameLength = Math.max(...files.map((file) => file.length))
  for (const file of files) {
    if (file.endsWith('.svg')) {
      const svgContent = fs.readFileSync(file, 'utf-8')
      const sizeBefore = Buffer.byteLength(svgContent, 'utf-8')
      const result = optimize(svgContent, { multipass: true }).data
      const sizeAfter = Buffer.byteLength(result, 'utf-8')
      fs.writeFileSync(file, result, 'utf-8')

      const fileName = file.padEnd(maxFileNameLength + 1, ' ')
      if (sizeBefore !== sizeAfter) {
        const changePercent = Math.round(((sizeBefore - sizeAfter) / sizeBefore) * 100)
        const changeSign = sizeAfter < sizeBefore ? '-' : '+'
        const change = `${changeSign}${changePercent}%`
        console.log(
          `${fileName}: ${prettyBytes(sizeBefore)} -> ${prettyBytes(sizeAfter)} (${change})`
        )
      } else {
        console.log(`${fileName}: no change`)
      }
    }
  }
}

function getAllFiles(dir: string): string[] {
  const dirents = fs.readdirSync(dir, { withFileTypes: true })
  return dirents.flatMap((dirent) => {
    const res = `${dir}/${dirent.name}`
    return dirent.isDirectory() ? getAllFiles(res) : res
  })
}

function prettyBytes(num: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let adjustedNum = num

  while (adjustedNum >= 1024 && unitIndex < units.length - 1) {
    adjustedNum /= 1024
    unitIndex++
  }

  return `${adjustedNum.toFixed(2)} ${units[unitIndex]}`
}

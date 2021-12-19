import { nativeImage } from 'electron';
import { getAssetPath } from './util';

const iconPath = getAssetPath('icons/48x48.png');
const pastePath = getAssetPath('menuItems/paste.png')
const searchPath = getAssetPath('menuItems/search.png')
const textPath = getAssetPath('menuItems/text.png')
const linkPath = getAssetPath('menuItems/link.png')
const imagePath = getAssetPath('menuItems/image.png')

export const images = {
  logo: nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 }),
  paste: nativeImage.createFromPath(pastePath).resize({ width: 15, height: 15 }),
  search: nativeImage.createFromPath(searchPath).resize({ width: 15, height: 15 }),
  text: nativeImage.createFromPath(textPath).resize({ width: 15, height: 15 }),
  link: nativeImage.createFromPath(linkPath).resize({ width: 15, height: 15 }),
  image: nativeImage.createFromPath(imagePath).resize({ width: 15, height: 15 }),
}
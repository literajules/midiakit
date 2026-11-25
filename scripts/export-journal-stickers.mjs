import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const out = "public/journal-stickers";
await mkdir(out, { recursive: true });
const files = [];
for (const [sheet, filename] of ["stickers.png", "stickers2.png"].entries()) {
  const { data, info: { width, height } } = await sharp("public/" + filename).flatten({ background: "#fff" }).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const count = width * height;
  const labels = new Int32Array(count);
  const queue = new Int32Array(count);
  const shapes = [];
  for (let i = 0; i < count; i++) {
    if (Math.min(data[i*3], data[i*3+1], data[i*3+2]) >= 249) labels[i] = -1;
  }
  let id = 0;
  for (let start = 0; start < count; start++) {
    if (labels[start]) continue;
    id++;
    queue[0] = start;
    labels[start] = id;
    let size = 1, left = width, right = 0, top = height, bottom = 0;
    for (let head = 0; head < size; head++) {
      const i = queue[head], x = i % width, y = Math.floor(i / width);
      left = Math.min(left,x); right = Math.max(right,x);
      top = Math.min(top,y); bottom = Math.max(bottom,y);
      for (let yy=Math.max(0,y-1); yy<=Math.min(height-1,y+1); yy++) {
        for (let xx=Math.max(0,x-1); xx<=Math.min(width-1,x+1); xx++) {
          const j=yy*width+xx;
          if (!labels[j]) { labels[j]=id; queue[size++]=j; }
        }
      }
    }
    if(size > count*0.003) shapes.push({id,left,right,top,bottom,size});
  }
  if (shapes.length !== 14) throw new Error(filename + ": expected 14 stickers, found " + shapes.length);
  shapes.sort((a,b)=>a.top-b.top || a.left-b.left);
  for (const [index,s] of shapes.entries()) {
    const w=s.right-s.left+1, h=s.bottom-s.top+1, rgba=Buffer.alloc(w*h*4);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      const i=(s.top+y)*width+s.left+x, p=(y*w+x)*4;
      if(labels[i]!==s.id) continue;
      data.copy(rgba,p,i*3,i*3+3);
      rgba[p+3]=255;
    }
    const name="sticker-"+(sheet+1)+"-"+String(index+1).padStart(2,"0")+".png";
    await sharp(rgba,{raw:{width:w,height:h,channels:4}}).png().toFile(out+"/"+name);
    files.push(name);
  }
}
await writeFile(out+"/index.json", JSON.stringify(files));

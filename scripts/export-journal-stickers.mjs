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
  const sets = [
    [[280,250],[810,155],[1030,402],[730,470],[280,800],[715,875],[1000,820],[365,1155],[775,1200],[992,1260],[578,1480],[1014,1480],[220,1800],[805,1770]],
    [[185,235],[540,280],[945,235],[555,550],[935,640],[270,900],[650,930],[950,968],[220,1250],[584,1230],[915,1310],[230,1740],[570,1645],[925,1810]]
  ];
  // Identify the sheet using its top-left square (the other sheet is white here).
  const sample=(Math.floor(height*.025)*width+Math.floor(width*.05))*3;
  const anchors=sets[Math.min(...data.subarray(sample,sample+3))<230?0:1];
  const selected=anchors.map(([x,y])=>{
    const px=Math.round(x*width/1152), py=Math.round(y*height/2048);
    let nearest=null, distance=Infinity;
    for(const shape of shapes){
      const dx=Math.max(shape.left-px,0,px-shape.right), dy=Math.max(shape.top-py,0,py-shape.bottom);
      const score=dx*dx+dy*dy;
      if(score<distance){nearest=shape;distance=score;}
    }
    return nearest;
  });
  if(new Set(selected).size!==14) console.warn("Some shapes touch in", filename);

  for (const [index,s] of selected.entries()) {
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

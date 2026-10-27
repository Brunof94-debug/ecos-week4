// Authored fiction for demonstration. These are not Bruno's family records.
export const SAMPLE = [
  { id:'m01', title:'The coat that outlived the rain', narrator:'Clara Duarte', year:1968, precision:'circa', event:'', kind:'Notebook excerpt',
    text:'Grandma Nair kept a tin of buttons under her chair. When the sleeve of my yellow coat tore, she turned the cuff inside out and stitched a patch shaped like a leaf.\nShe never threw a garment away while the cloth could still hold a needle. I wore that coat until the sleeves stopped reaching my wrists.\nI think this was around 1968. I cannot remember the exact year.' },
  { id:'m02', title:'A tune behind the kitchen door', narrator:'Rui Duarte', year:1974, precision:'year', event:'', kind:'Written memory',
    text:'In 1974, Dad carried his little wooden radio from the repair shop into our kitchen. One corner was burnt and the dial had no numbers.\nHe replaced a loose wire and made music come out of it again. For weeks he whistled along while he washed the dishes.\nThe radio finally stopped in the nineties. I kept its wooden case.' },
  { id:'m03', title:'When the whole street went dark', narrator:'Clara Duarte', year:1985, precision:'year', event:'', kind:'Notebook excerpt',
    text:'The electricity failed during my birthday supper in 1985. Our neighbours brought candles and we carried the table into the courtyard.\nSomeone beat a spoon against a glass and everybody sang. The cake had collapsed in the oven, so we ate warm batter from little bowls.\nFor years afterwards I asked for the same birthday supper, but the candles never felt quite as bright.' },
  { id:'m04', title:'Four aprons, one crowded stove', narrator:'Lia Duarte', year:1988, precision:'year', event:'', kind:'Recipe margin',
    text:'Before the neighbourhood festival in 1988, four of us squeezed around Nair’s stove to make bread. She measured everything with a chipped blue cup.\nWe argued about how much flour she meant. She laughed, pressed my hand into the dough and said it should feel like an earlobe.\nThe recipe never gave a weight. The blue cup is still on my shelf.' },
  { id:'m05', title:'The last seat by the window', narrator:'Rui Duarte', year:1983, precision:'circa', event:'', kind:'Written memory',
    text:'We left the small town carrying two suitcases and a basket of oranges. Mum gave the window seat to my sister because she felt sick on trains.\nAt the station, Grandpa lifted his hat until our carriage disappeared. I remember his red scarf more clearly than the platform.\nThis was about 1983, perhaps the following year. We were moving to the coast.' },
  { id:'m06', title:'The first river crossing — Clara', narrator:'Clara Duarte', year:1987, precision:'year', event:'First river crossing', kind:'Written memory',
    text:'Our first family crossing in the little blue boat was in 1987. Rui held the rope while I passed the picnic basket over the side.\nThe engine stopped halfway across. We rowed to a muddy bank and ate our sandwiches there.\nI am certain about the basket. I might be less certain about the year.' },
  { id:'m07', title:'The first river crossing — Rui', narrator:'Rui Duarte', year:1989, precision:'year', event:'First river crossing', kind:'Written memory',
    text:'I remember our first family crossing in the blue boat as 1989, after I finished my apprenticeship. Clara says it was earlier.\nThe engine would not start again and we had to paddle. By the time we reached the bank, the picnic cloth was soaked.\nI never found a photograph with a date on the back.' },
  { id:'m08', title:'The scent in the unopened drawer', narrator:'Lia Duarte', year:null, precision:'unknown', event:'', kind:'Undated letter',
    text:'After Nair died, I found a folded apron in the bottom drawer. It smelled faintly of orange peel and the soap she used on Sundays.\nI put it back without washing it. Some days I open that drawer just for a moment.\nThis letter has no date. I do not know when I wrote it.' },
].map(m => ({...m}));

export const EVALUATION_QUERIES = [
  { query:'Who gave broken clothes a second life?', relevant:['m01'] },
  { query:'Who made damaged electronics work again?', relevant:['m02'] },
  { query:'A celebration without electric lights', relevant:['m03'] },
  { query:'Learning to bake by touch instead of precise measurements', relevant:['m04'] },
  { query:'Leaving home for a different place', relevant:['m05'] },
  { query:'A boat trip remembered in two different years', relevant:['m06','m07'] },
  { query:'Keeping an object to remember someone who died', relevant:['m08'] },
  { query:'Quem consertava roupas em vez de comprar outras?', relevant:['m01'] },
  { query:'Uma festa durante uma queda de energia', relevant:['m03'] },
  { query:'Qual lembrança fala de mudar de cidade?', relevant:['m05'] },
  { query:'Saudade da avó através de um cheiro', relevant:['m08'] },
  { query:'Um passeio de barco com datas diferentes', relevant:['m06','m07'] },
];

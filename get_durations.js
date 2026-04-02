const https = require('https');
const ids = ['E1X1RFFt138', '4J_sUv_L5f0', 'YglY46sa7oA', 'w76w1arkX7E', 'tmP81NRePkA', 'dcKOKETcrK4', 'XjogZEgAA2M', '_iRggg9Y_UQ', 'ptIFWQ_cJIQ', 'ftKaRv5WUmk', 'Gab0IJ_-8tQ', 'vcEzTp2HEF4', 'ugvAoQFZCf8', 'f47-76tui34', 'Hp1yBFQ4e2o', '-GIBgYF63ko', 'iElZRUtCE14', 'dg9FUWQShk0', 'lYvPIHaV4O0', 'ChlT_2r96R4', 'ZqHuz3kBS-4', 'l7QKm6WsqBA', 'Er5l3ptq6RM', '8X8A_tso5Dk', 'ElQf1fTFPCw', 'DXZWVrGW3DI', 'N_aayNO3RmM', 'Oe5m4qBXJYQ', 'z0h8iw7-pfc', 'yHO54z55JkA', 's3SfINGk5Bw', '0b8vw2bJ6g8'];
let c = 0;
ids.forEach(id => {
  https.get('https://www.youtube.com/watch?v='+id, res => {
    let data = '';
    res.on('data', chunk => data+=chunk);
    res.on('end', () => {
      let m = data.match(/"lengthSeconds":"(\d+)"/);
      if(!m) m = data.match(/"approxDurationMs":"(\d+)"/);
      
      if(m) {
        let sec = parseInt(m[1]);
        if(m[0].includes("approxDurationMs")) sec = Math.floor(sec/1000);
        let mins = Math.floor(sec/60);
        let rem = sec%60;
        console.log(id+': '+mins.toString().padStart(2,'0')+':'+rem.toString().padStart(2,'0'));
      } else {
        console.log(id+': 00:00');
      }
    });
  });
});

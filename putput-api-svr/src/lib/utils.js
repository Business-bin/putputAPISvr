
const Team12_Infos = [
  {name: '드레서', jc: 0, tinx:1, trib: '의', pdt: '옷'},
  {name: '세공사', jc: 1, tinx:1, trib: '의', pdt: '보석'},
  {name: '무두장이', jc: 2, tinx:1, trib: '의', pdt: '가죽'},
  {name: '재단사', jc: 3, tinx:1, trib: '의', pdt: '옷감'},
  {name: '농부', jc: 4, tinx:2, trib: '식', pdt: '곡물'},
  {name: '쉐프', jc: 5, tinx:2, trib: '식', pdt: '요리'},
  {name: '어부', jc: 6, tinx:2, trib: '식', pdt: '생선'},
  {name: '소믈리에', jc: 7, tinx:2, trib: '식', pdt: '와인'},
  {name: '설계사', jc: 8, tinx:3, trib: '주', pdt: '설계도'},
  {name: '건축가', jc: 9, tinx:3, trib: '주', pdt: '집'},
  {name: '배관공', jc: 10, tinx:3, trib: '주', pdt: '파이프'},
  {name: '조경사', jc: 11, tinx:3, trib: '주', pdt: '나무'}
];

const getJobInfoFromJc = (jc) => {
  return Team12_Infos[jc];
};

module.exports = {
  getJobInfoFromJc
};

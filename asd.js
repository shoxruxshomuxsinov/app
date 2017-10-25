let a = {};

let b = "shoxrux";

let c = "aaa";

let d = "eqweqw";

let e = "fsd";


a[b] = "shomuxsinov";
a[c] = "dsadas";
a[d] = "qweqwe"
a[e] = "fsdfsdf";

console.log(a);
delete a["shoxrux"];

a = JSON.stringify(a);
console.log(a);
a = JSON.parse(a);

console.log(a);


function toRet(asd){
  return asd;
}

let o = toRet(a);

console.log("________________________________________________________________");

console.log(o);

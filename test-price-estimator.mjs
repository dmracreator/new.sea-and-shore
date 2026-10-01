import assert from"node:assert/strict";import{estimate}from"./estimate.js";
const basic=estimate({container:"20DV",quantity:2});assert.equal(basic.total,2490);assert.equal(basic.low,2241);assert.equal(basic.high,2789);assert.equal(estimate({container:"40DV",quantity:1,customs:true,delivery:true,warehouse:true}).total,2595);console.log("price estimator checks passed");

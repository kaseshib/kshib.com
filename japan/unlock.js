'use strict';
const form=document.querySelector('#unlock'),status=document.querySelector('#status'),submit=document.querySelector('#submit');
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let envelope;
async function loadEnvelope(){
 if(!envelope){const response=await fetch('trip.json',{cache:'no-store'});if(!response.ok)throw new Error('load');envelope=await response.json();}
 return envelope;
}
async function unlock(password){
 if(!window.isSecureContext||!crypto.subtle)throw new Error('https');
 const data=await loadEnvelope();
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(data.salt),iterations:data.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
 let plain;
 try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(data.iv)},key,bytes(data.data));}catch{throw new Error('password');}
 const html=new TextDecoder().decode(plain);
 document.open();document.write(html);document.close();
}
form.addEventListener('submit',async event=>{
 event.preventDefault();submit.disabled=true;submit.textContent='Opening…';status.textContent='';
 try{await unlock(document.querySelector('#password').value.trim());}
 catch(error){status.textContent=error.message==='password'?'That password did not work. Try copying it again.':error.message==='https'?'Open this page using its HTTPS address to unlock it.':'The itinerary could not load. Check your connection and try again.';submit.disabled=false;submit.textContent='Open the journal ↗';}
});

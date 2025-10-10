const img = document.querySelector(".main img");
const submitBoutton = document.querySelector("#send");
const comment = document.querySelector("body > div > div.main > div.formulaire > form > input[type=text]:nth-child(1)");
if(submitBoutton) submitBoutton.disabled = true;


document.addEventListener("click",(e)=>{
    if(e.target.tagName == 'IMG' && e.target.parentNode.parentNode.tagName != 'SPAN'){
        img.style.height = String(img.height + 10) +"px";
    }
    
});

document.addEventListener("contextmenu",(e)=>{
    if(e.target.tagName == 'IMG' && e.target.parentNode.parentNode.tagName != 'SPAN'){
        e.preventDefault();
        img.style.height = String(img.height - 10) +"px";
    }
});

if(comment && submitBoutton) comment.addEventListener("keyup",(e) =>{
    console.log(comment.value);
    if(comment.value === ""){ 
        console.log("nulle");
        submitBoutton.disabled = true;
    }
    else {
        console.log("oui");
        submitBoutton.disabled = false;
    }
    console.log(submitBoutton.disabled);
});

if(comment && submitBoutton) document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if(comment.value === ""){
            e.preventDefault()
        }
    }
});

if(comment && submitBoutton) submitBoutton.addEventListener("mouseover", (e) => {
    if(comment.value === ""){
        submitBoutton.disabled = true;
    }
});
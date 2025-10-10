const signupButton = document.querySelector("#signup");
const back = document.querySelector(".screen");
const signinButton = document.querySelector("#signin");
var active = "";

var id;
var mdp;
var submitButton;


signupButton.addEventListener("click", (e) =>{
    if(e.target == signupButton){ if(active !== "signup") createSignUp(); }
});


signinButton.addEventListener("click", (e) =>{
    if(e.target == signinButton) { if(active !== "signin") createSignIn(); }
});


function createSignIn() {
    back.style.transition = "filter 0.5s";
    back.style.filter = "blur(4px)";
    back.style.pointerEvents = "none";
    var form = document.querySelector(".signform")
    if(form){
        const h1 = document.getElementsByClassName("titre")[0];
        form.setAttribute("action", "/signin");
        h1.innerText = "Connectez-vous à votre Compte";
    } else {
    form = createIn("in");
    document.body.appendChild(form);
    }
    active = "signin";
    addEv();
}

function createSignUp() {
    back.style.transition = "filter 0.5s";
    back.style.filter = "blur(4px)";
    back.style.pointerEvents = "none"
    var form = document.querySelector(".signform")
    if(form) {
        const h1 = document.getElementsByClassName("titre")[0];
        form.setAttribute("action", "/signup");
        h1.innerText = "Créez votre compte";
    }
    else {
        form = createIn("up");
        document.body.appendChild(form);
    }
    active = "signup";
    addEv();
}


function createIn(str) {
    var texte = "";
    if(str === "up")  texte = "Créez votre compte";
    else  texte = "Connectez-vous à votre compte";
    
    var signpage = document.createElement('div');
    signpage.classList.add("signpage");

    var x = document.createElement('button');
    x.classList.add('closebutton');
    x.innerText = 'x';
    var form = document.createElement('form');
    form.classList.add('signform');
    form.setAttribute("action","/sign"+str);
    form.setAttribute("method", "post");
    const input1 = document.createElement("input");
    input1.classList.add('texte');
    input1.setAttribute("type","text");
    input1.setAttribute("name","id");
    input1.setAttribute("placeholder","identifiant");
    const input2 = document.createElement("input");
    input2.classList.add('texte');
    input2.setAttribute("type","password");
    input2.setAttribute("name","mdp");
    input2.setAttribute("placeholder","mot-de-passe");
    const submit = document.createElement("input");
    submit.setAttribute("type", "submit");
    submit.setAttribute("value", "envoyer");
    form.innerHTML += "<h1 class='titre'>"+texte+"</h1>"
    form.appendChild(input1);
    form.appendChild(input2);
    form.appendChild(submit);
    signpage.appendChild(form)
    signpage.appendChild(x);
    // Retourner le formulaire créé
    return signpage;
}

function addEv(){
    submitButton = document.querySelector("body > div.signpage > form > input[type=submit]:nth-child(4)");
    id = document.querySelector("body > div.signpage > form > input:nth-child(2)");
    mdp = document.querySelector("body > div.signpage > form > input:nth-child(3)");
    closeButton = document.querySelector("body > div.signpage > button");
    console.log("yooo");
    submitButton.disabled = "true";
    id.addEventListener("keyup",(e) =>{
        if(id.value === "" || mdp.value ===""){ 
            console.log("nulle");
            submitButton.disabled = true;
        }
        else {
            console.log("oui");
            submitButton.disabled = false;
        }
        console.log(submitButton.disabled);
    });
    mdp.addEventListener("keyup",(e) =>{
        if(id.value === "" || mdp.value ===""){ 
            console.log("nulle");
            submitButton.disabled = true;
        }
        else {
            console.log("oui");
            submitButton.disabled = false;
        }
        console.log(submitButton.disabled);
    });

    closeButton.addEventListener("click", (e) => {
        active = ""
        var sign = document.querySelector("body > div.signpage");
        document.body.removeChild(sign);
        back.style.filter = "blur(0)";
        back.style.pointerEvents = "auto";
        console.log("delete");

    })
}


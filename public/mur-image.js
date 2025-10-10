const imgs = document.querySelectorAll(".img_mur");



imgs.forEach(img =>{
    var bar = img.querySelector(".like_bar");
    var image = img.querySelector("img");
    var like_icon = bar.children[0].children[0].children[0];
    var on;
    var liked = img.getAttribute("liked");
    if(liked == 'true') {
        like_icon.style.fill = 'red';
    }
    var on_like = false;
    addEventListener("mouseover", (e) => {
        on = check_on(e.target);
        img.setAttribute("on",on);
        if(on || on_like)
        {
            bar.style.pointerEvents = 'visible';
            like_icon.style.pointerEvents = 'visibleFill';
            //like_icon.style.fill ="white";
            bar.style.bottom = "10px";
            bar.style.backgroundColor = "rgba(240,240,240, 0.70)";
        } 
        else
        {
            bar.style.pointerEvents = 'none';
            like_icon.style.pointerEvents = 'none';
            bar.style.backgroundColor = "rgba(255,255,255,0)";
            bar.style.bottom = "-1000px";
        }
    });

    addEventListener("mouseover", (e) => {
        if(e.target == like_icon || on){
            on_like = true;
            like_icon.setAttribute("on",on_like);

        } else {
            on_like = false;
            like_icon.setAttribute("on",on_like);
        }
    })

    function check_on(e)
    {
        if(e == bar || e == image || e == bar.children || e == bar.children[0]) return true;
        return false;        
    }
});


function handleclick(e) {
    const target = e.target.parentNode.parentNode.parentNode.parentNode;   // l'image  
    const heart_like = document.querySelector("#"+target.id+" svg");
    const like_text = target.children[1].children[0].children[1]; // l'endroit ou se trouve le numero de like à changer
    const nbLike = Number(target.getAttribute("like"));  // le nombre de like
    changelike(target, heart_like, like_text, nbLike);
}
function changelike(target, heart, component, nbLike) {
    var id = target.id.split('_')[1];
    if(target.getAttribute("liked") == "false") {
        var is_good;
        var message;
        addLike(id).then(res => {
            is_good = res[0];
            message = res[1];
            console.log(is_good);
            console.log(message);
            if(is_good){
                target.setAttribute("liked", "true");
                heart.style.fill = "red";
                heart.setAttribute("like", nbLike + 1);
                var new_nbLike = heart.getAttribute("like");
                component.innerText = new_nbLike;
            }   
        });     
    } /* else {
        removeLike(id).then(res => {
            is_good = res;
            console.log(res);
            if(is_good){
                target.setAttribute("liked", "false");
                target.style.fill = "white";
                target.setAttribute("like", nbLike - 1);
                var new_nbLike = target.getAttribute("like");
                component.innerText = new_nbLike;
            }
        })  
    } */

}

async function addLike(id){
    const res = await fetch('/like_add/'+id);
    const message = await res.text();
    const done = res.ok;
    return [done, message];      
    
}

/* async function removeLike(id){
    const res = await fetch('/like_remove/'+id);
    const message = await res.text();
    const done = res.ok;
    return [done, message];  
} */



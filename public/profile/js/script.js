
//create an event listener
document.getElementById('button').addEventListener('click',loadText);
function loadText(){
    //create xhr object
    var xhr=new XMLHttpRequest();
    //open-type,url/file,async
    xhr.open('GET','sample.txt',true);
    xhr.onload=function(){
        if(this.status==200){
            console.log(this.responseText);
        }
        //send request
        xhr.send();
    }


}

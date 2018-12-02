document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('input').onclick = e =>{
        console.log('page loaded')
        var username = document.getElementById("username").value;
	    var password = document.getElementById("password").value;
	    alert(username); 
        alert(password);
    }
})
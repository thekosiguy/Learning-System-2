const user_input = (function(user_data){
    return{
        userData: user_data => {
            return (user_data.username, user_data.password);
        }
    }

})()
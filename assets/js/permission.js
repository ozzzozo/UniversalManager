
/*
    All of functions for the permission in client side, 
    you choose which you want to use in the ejs file by calling the function 
*/

const USERS_CREATE = "users.create";
const USERS_CHANGE = "users.change";
const USERS_DELETE = "users.delete";
const WORKSPACES_CREATE = "workspaces.create";
const WORKSPACES_EDIT = "workspaces.edit";

function createWorkspaceListener() {
    let link = document.getElementById("createUrl");
    
    link.addEventListener("click", function (event) {
        if(perms.includes(WORKSPACES_CREATE)) {
            window.location.href = "/workspaces/create";
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You don\'t have the required permissions to create a workspace!',
                footer: 'Contact Your supervisor to fix this issue.'
              });
        }
    });
}
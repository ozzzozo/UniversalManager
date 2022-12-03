
/*
    All of functions for the permission in client side, 
    you choose which you want to use in the ejs file by calling the function 
*/

const USERS_CREATE = "users.create";
const USERS_CHANGE = "users.change";
const USERS_DELETE = "users.delete";
const WORKSPACES_CREATE = "workspaces.create";
const WORKSPACES_EDIT = "workspaces.edit";
const REPORTS_CREATE = "reports.create";

function createWorkspaceListener(id) {
    let link = document.getElementById(id);
    
    link.addEventListener("click", function (event) {
        if(perms.includes(WORKSPACES_CREATE)) {
            window.location.href = "/workspaces/create";
        } else {
            popup(251);
        }
    });
}

async function popup(code) {
    let details = getError(code);

    Swal.fire({
        icon: details[0],
        title: details[1],
        text: details[2],
        footer: 'Contact Your supervisor to fix this issue.'
      });
}

var checkboxes = document.querySelectorAll("input[type='checkbox']");
const minhaCheckbox = document.getElementById('todas-opcoes');

function checkTodos(minhaCheckbox){
    if(minhaCheckbox.checked === true){
        checkboxes.forEach(function(checkbox){
            checkbox.checked = true;
        })
    }else{
        checkboxes.forEach(function(checkbox){
            checkbox.checked = false;
        });
    } 
}

minhaCheckbox.addEventListener("change", function() {
    checkTodos(minhaCheckbox);
});
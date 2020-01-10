
$(document).ready(function () {
    $('form').submit(function (e) {
        e.preventDefault();
        let data = $('form').serializeArray()
        console.log(data)
    });

    let emailElement = $('#emailElement').clone()
    let contactElement = $('#contactElement').clone()

    $('#addAnotherEmail').click(function () {
        $('#emailElement').after(emailElement)
    })

    $('#addAnotherContact').click(function () {
        $('#contactElement').after(contactElement)
    })
})

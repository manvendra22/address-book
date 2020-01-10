
$(document).ready(function () {
    $('form').submit(function (e) {
        e.preventDefault();
    });

    $('#addData').click(function () {
        let data = $('form').serializeArray()
        console.log(data)
    });
})

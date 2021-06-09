let categories = []

let table = 'customers'


  
$.getJSON(`${table}/all`, data => {
    categories = data
    makeTable(data)
    
  


})

function makeTable(categories){
      let table = ` <div class="table-responsive">

     
<table id="report-table" class="table table-bordered table-striped mb-0">
<thead>
<tr>

<th>Name</th>
<th>Number</th>
<th>Actions</th>
</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>

<td>${item.name}</td>
<td>${item.number}</td>
<td><a href='/customers/wishlist/?number=${item.number}'>Wishlist</a></td>
<td><a href='/customers/orders/?number=${item.number}'>Orders</a></td>
<td>

</td>
</tr>`
})
table+=`</tbody>
</table>
</div>

    
  <!-- End Row -->`
      $('#result').html(table)
      $('#insertdiv').hide()
      $('#result').show()
}




$('#result').on('change', '.action', function() {
let a = $('#action').val()
window.location.href = `/customers/${a}`

})


$('#result').on('click', '.deleted', function() {
    const id = $(this).attr('id')
     $.get(`${table}/delete`,  { id }, data => {
        refresh()
    })
})



$('#result').on('click', '.edits', function() {
    const id = $(this).attr('id')
    const result = categories.find(item => item.id == id);
  
    $('#editdiv').show()
    $('#result').hide()
    $('#insertdiv').hide() 
    $('#pid').val(result.id)
     $('#pname').val(result.name)
   
 })



 $('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    const result = categories.find(item => item.id == id);
    $('#peid').val(result.id)
})



 
$('#update').click(function(){  //data insert in database
    let updateobj = {
        id: $('#pid').val(),
        name: $('#pname').val(),
       
        }

    $.post(`${table}/update`, updateobj , function(data) {
       update()
    })
})






function refresh() 
{
    $.getJSON(`${table}/all`, data => makeTable(data))
}
function update()
{
    $('#result').show()
    $('#editdiv').hide()
    $('#insertdiv').show() 
    refresh()
    refresh()
}

//================================Page Functionality=============================//
$('#editdiv').hide()
$('#updateimagediv').hide()

$('#result').on('click', '#back', function() {
    $('#result').hide()
    $('#insertdiv').show()
})

$('#back1').click(function(){
    $('#result').show()
    $('#insertdiv').hide()
    $('#editdiv').hide()
    $('#updateimagediv').hide()

})

$('#back2').click(function(){
    $('#result').show()
    $('#insertdiv').hide()
    $('#editdiv').hide()
    $('#updateimagediv').hide()
})

$('#result').on('click', '.updateimage', function() {
    $('#updateimagediv').show()
    $('#result').hide()
    $('#insertdiv').hide()
    $('#editdiv').hide()
})



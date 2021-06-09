let categories = []
let subcategories = []

let services = []
let brands = []
let sizes = []
start()





$.getJSON(`/category/all`, data => {
    categories = data
    fillDropDown('categoryid', data, 'Choose Category', 0)
})


$.getJSON(`/size/all`, data => {
    sizes = data
    fillDropDown('sizeid', data, 'Choose Size', 0)
})




$.getJSON(`/subcategory/all`, data => {
    subcategories = data
    fillDropDown('subcategoryid', [], 'Choose Subcategory', 0)
})


$.getJSON(`/brand/all`, data => {
    brands = data
    fillDropDown('brandid', [], 'Choose Brand', 0)
})

$('#categoryid').change(() => {
    const filteredData = subcategories.filter(item => item.categoryid == $('#categoryid').val())
    fillDropDown('subcategoryid', filteredData, 'Choose Subcategory', 0)
})


$('#categoryid').change(() => {
    const filteredData = brands.filter(item => item.categoryid == $('#categoryid').val())
    fillDropDown('brandid', filteredData, 'Choose Brand', 0)
})



function fillDropDown(id, data, label, selectedid = 0) {
    $(`#${id}`).empty()
    $(`#${id}`).append($('<option>').val("null").text(label))

    $.each(data, (i, item) => {
        if (item.id == selectedid) {
            $(`#${id}`).append($('<option selected>').val(item.id).text(item.name))
        } else {
            $(`#${id}`).append($('<option>').val(item.id).text(item.name))
        }
    })
}

$('#show').click(function(){
$.getJSON(`/purchase-product/all`, data => {
    console.log(data)
    services = data
    makeTable(data)
})

})



function makeTable(categories){
    let table = ` <div class="table-responsive">

    <button type="button" id="back" class="btn btn-primary" style="margin:20px">BacK</button>
<table id="report-table" class="table table-bordered table-striped mb-0">
<thead>
<tr>
<th>Product</th>
<th>Short Name</th>
<th>Category</th>
<th>Subcategory</th>
<th>Brand</th>
<th>Price</th>
<th>Discount</th>
<th>Net Amount</th>
<th>Quantity</th>
<th>Image</th>
<th>Option</th>

</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>

<td>${item.name}</td>
<td>${item.short_name}</td>
<td>${item.categoryname}</td>
<td>${item.subcategoryname}</td>
<td>${item.brandname}</td>
<td>${item.price}</td>
<td>${item.discount}</td>
<td>${item.net_amount}</td>
<th>${item.quantity}</td>
<td>
<img src="/images/${item.image}" class="img-fluid img-radius wid-40" alt="" style="width:50px;height:50px">
</td>
<td>
<a href="#!" class="btn btn-info btn-sm edits" id="${item.id}"><i class="feather icon-edit"></i>&nbsp;Edit </a>
<a href="#!" class="btn btn-info btn-sm updateimage"  id="${item.id}"><i class="feather icon-edit"></i>&nbsp;Edit Image </a>
<a href="#!" class="btn btn-danger btn-sm deleted" id="${item.id}"><i class="feather icon-trash-2"></i>&nbsp;Delete </a>
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




$('#result').on('click', '.deleted', function () {
    const id = $(this).attr('id')
    $.get(`/purchase-product/delete`, { id }, data => {
        refresh()
    })
})

let selectedSubcategory = 0


$('#pcategoryid').change(() => {
    const filteredData = subcategories.filter(item => item.categoryid == $('#pcategoryid').val())
    fillDropDown('psubcategoryid', filteredData, 'Choose Sub-Category', 0)
})






$('#pcategoryid').change(() => {
    const filteredData = brands.filter(item => item.categoryid == $('#pcategoryid').val())
    fillDropDown('pbrandid', filteredData, 'Choose Brand', 0)
})



$('#result').on('click', '.edits', function () {
    


  
    const id = $(this).attr('id')
    const result = services.find(item => item.id == id);

    fillDropDown('pcategoryid', categories, 'Choose Category', result.categoryid)
    fillDropDown('psizeid', sizes, 'Choose Size', result.sizeid)
    $('#psubcategoryid').append($('<option>').val(result.subcategoryid).text(result.subcategoryname))
    $('#pbrandid').append($('<option>').val(result.pbrandid).text(result.brandname))



    edit()
    $('#pid').val(result.id)
    $('#pname').val(result.name)
    $('#psubcategoryid').val(result.subcategoryid)
    $('#Pcategoryid').val(result.categoryid);
    $('#pdiscount').val(result.discount);
    $('#pprice').val(result.price);
    $('#pbrandid').val(result.branid);
    $('#pshort_name').val(result.short_name);
    $('#psizeid').val(result.sizeid);
    $('#pquantity').val(result.quantity);
    $('#pdescription').val(result.description);
  //  $('#pextra').val(result.extra);
     //$('#peid').val(result.id)
    
})



$('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    const result = services.find(item => item.id == id);
    $('#peid').val(result.id)
})


$('#update').click(function () {  //data insert in database
    let updateobj = {
        id: $('#pid').val(),
        categoryid: $('#pcategoryid').val(),
        subcategoryid: $('#psubcategoryid').val(),
        name: $('#pname').val(),
        price:$('#pprice').val(),
        discount : $('#pdiscount').val(),
        brandid : $('#pbrandid').val(),
        description : $('#pdescription').val(),
        sizeid : $('#psizeid').val(),
       short_name : $('#pshort_name').val(),
        quantity : $('#pquantity').val(),
       
    }

    $.post(`/purchase-product/update`, updateobj, function (data) {
      update()
    })
})



function start()
{
$('#editdiv').hide()
$('#back').hide()
$('#insertdiv').show()
$('#updateimagediv').hide()
$('#result').hide()

}
function insert()
{
     $('#insertdiv').show(1000)
    $('#back').show()
    $('#refresh').hide()
    $('#result').hide()
    $('#editdiv').hide()
}
function back()
{
    $('#refresh').show()
    $('#editdiv').hide()
    $('#back').hide()
    $('#insertdiv').hide()
    $('#result').show(1000)
}
function insertdata()
{
    $('#editdiv').hide()
    $('#back').hide()
    $('#insertdiv').hide()
    $('#refresh').show()
    $('#result').show()
    refresh()
}
function edit()
{
    $('#back').show()
    $('#refresh').hide()
    $('#editdiv').show()
    $('#result').hide()
}
function update()
{
    $('#result').show()
    $('#editdiv').hide()
    $('#insertdiv').hide()
    refresh()
}

$('#new').mouseenter(function () {
    insert()
 })
 
 $('#back').mouseenter(function () {
     back()
 })
 
 function refresh() {
     $.getJSON(`/purchase-product/all`, data => {
         makeTable(data)
     })
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
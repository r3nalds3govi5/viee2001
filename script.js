// Custom Loader Element Node
var loader = document.createElement('div')
loader.setAttribute('id', 'pre-loader');
loader.innerHTML = "<div class='lds-hourglass'></div>";

// Loader Start Function
window.start_loader = function() {
    if (!document.getElementById('pre-loader') || (!!document.getElementById('pre-loader') && document.getElementById('pre-loader').length <= 0))
        document.querySelector('body').appendChild(loader)
}

// Loader Stop Function
window.end_loader = function() {
    if (!!document.getElementById('pre-loader')) {
        setTimeout(() => {
            document.getElementById('pre-loader').remove()
        }, 500)
    }
}
const el_msg = $('<div>')
el_msg.addClass('alert pop-msg rounded-0')
el_msg.html("<div class='d-flex w-100 align-items-center justify-content-between'><div class='msg'></div><div class='text-end'><button class='btn-close'></button></div></div>")
el_msg.hide()
el_msg.find('.btn-close').click(function() {
    console.log('close')
    el_msg.remove()
})

function show_msg(node = null) {
    if (node != null) {
        $('#msg-field').append(node)
        node.show('slideDown')
        node.find('.btn-close').click(function() {
            node.remove()
        })
        setTimeout(() => {
            node.remove()
        }, 3500)
    }
}

function load_items() {
    var items = !!localStorage.getItem('item') ? $.parseJSON(localStorage.getItem('item')) : {};
    var checked = !!localStorage.getItem('checked') ? $.parseJSON(localStorage.getItem('checked')) : {};
    $('#item-list').html('')
    Object.keys(items).map(k => {
        var data = items[k]
        var li = $($('noscript#item-clone').html()).clone()
        li.attr('data-id', data.id)
        li.find('.btn-check').attr('id', 'item-check' + data.id)
        li.find('label[for="item-check"]').attr('for', 'item-check' + data.id)
        li.find('.item').text(data.item)
        li.find('.item-qty').text(data.quantity)
        li.find('.edit-data').attr('data-id', data.id)
        li.find('.delete-data').attr('data-id', data.id)
        if (!!checked[data.id] && checked[data.id] == true) {
            li.addClass('item-checked')
            li.find('.btn-check').attr('checked', true)
        }
        $('#item-list').append(li)
        li.find('.edit-data').click(function() {
            var modal = $('#formModal')
            modal.find('.modal-title').html('<i class="fa fa-edit"></i> Edit Check List')
            modal.find('[name="id"]').val(data.id)
            modal.find('[name="item"]').val(data.item)
            modal.find('[name="quantity"]').val(data.quantity)
            modal.modal('show')
        })
        li.find('.delete-data').click(function() {
            start_loader()
            var msg = el_msg.clone()
            if (confirm("Are you sure to delete '" + data.item + "' from check list?") === true) {
                try {
                    delete items[data.id]
                    if (!!checked[data.id])
                        delete checked[data.id]
                    localStorage.setItem('item', JSON.stringify(items))
                    localStorage.setItem('checked', JSON.stringify(checked))
                    msg.addClass('alert-success')
                    msg.find('.msg').text("Item has been deleted successfully.")
                    load_items()
                } catch (err) {
                    console.error(err)
                    msg.addClass('alert-danger')
                    msg.find('.msg').text("Item has failed to delete.")
                }
                show_msg(msg)
            }
            end_loader()
        })
        li.find('.btn-check').change(function() {
            if ($(this).is(':checked') == true) {
                li.addClass('item-checked')
                if (!checked[data.id])
                    checked[data.id] = true
            } else {
                li.removeClass('item-checked')
                if (checked[data.id])
                    checked[data.id] = false
            }
            localStorage.setItem('checked', JSON.stringify(checked))
        })

    })
}


$(function() {
    end_loader();
    load_items()
    $('#new_item').click(function() {
        var modal = $('#formModal')
        modal.find('.modal-title').html('<i class="fa fa-plus"></i> Add New Check List')
        modal.modal('show')
    })
    $('#search').on('input', function() {
        var search = $(this).val().toLowerCase()
        $('#item-list .list-group-item').each(function() {
            var text = ''
            $(this).find('.item, .item-qty').each(function() {
                text += $(this).text().toLowerCase()
                text += ' '
            })
            if (text.includes(search) == true) {
                $(this).toggle(true)
            } else {
                $(this).toggle(false)
            }
        })
    })
    $('#formModal').on('hidden.bs.modal', function() {
        $('#grocery-form')[0].reset()
    })
    $('#formModal').on('shown.bs.modal', function() {
        $('#grocery-form').find('[name="item"]').focus()
    })
    $('#grocery-form').submit(function(e) {
        e.preventDefault()
        var _this = $(this)
        var msg = el_msg.clone()
        $('.pop-msg').remove()
        start_loader()
        var items = !!localStorage.getItem('item') ? $.parseJSON(localStorage.getItem('item')) : {};
        id = _this.find('[name="id"]').val()
        item = _this.find('[name="item"]').val()
        quantity = _this.find('[name="quantity"]').val()
        if (id == '') {
            while (true) {
                id = Math.floor(Math.random() * 999999999)
                if (!items[id])
                    break;
            }
        }
        try {
            items[id] = {
                id: id,
                item: item,
                quantity: quantity
            }
            localStorage.setItem('item', JSON.stringify(items))
            msg.addClass('alert-success')
            msg.find('.msg').text('Item has been successfully saved.')
            load_items()
            _this[0].reset()
        } catch (err) {
            console.error(err)
            msg.addClass('alert-danger')
            msg.find('.msg').text('Item has failed to save.')
        }
        show_msg(msg)
        $('.modal').modal('hide')
        end_loader()
    })
    $('#grocery-form').on('reset', function() {
        $(this).find('input:hidden').val('')
    })
})
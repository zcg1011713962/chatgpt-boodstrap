// 接口地址 鉴权
var api_address;
var token;
// 支持模式
const CHAT = Object.freeze({
    txt: '文本咨询',
    image: '图像生成'
})
const INPUT = Object.freeze({
    txt: '在此处输入要咨询的问题，点击发送按钮',
    image: '在此输入图像关键字，点击发送按钮'
})
// 模型
const MODEL = Object.freeze({
    default: 'gpt-3.5-turbo'
})
// 图片大小
const IMAGE = Object.freeze({
    small: '256x256',
    middle: '512x512',
    big: '1024x1024'
})

// 按钮发送
$("#chatBtn").click(function () {
    send();
});
// 回车发送
$(document).keypress(function(event) {
    if (event.which === 13) {
        event.preventDefault();
        send();
    }
});
// 按钮清理
$('#clearBtn').click(function () {
    $('#content-ul').empty();
});

$(function(){
    // 展示时间
    setInterval(function() {
        let currentTime = new Date();
        $('#current-time').text(currentTime.toLocaleTimeString());
    }, 1000);

    // 展示访问量
    setInterval(function() {
        $.ajax({
            url: api_address + "/v1/chat/count",
            type: 'GET',
            success: function(response) {
                if(response.code === 200){
                    $('#website-visits').text(response.data.count);
                }
            }
        });
    }, 10000);
    // 切换模式
    $('input[name="btnradio"]').on('change', function(){
        var checkedValue = $('input[name="btnradio"]:checked').val();
        console.log(checkedValue);
    });
});

// 显示图片模态框
function showimageModal(src) {
    var imageModal = $('#imageModal');
    imageModal.find('.modal-body img').attr('src', src);
    imageModal.modal('show');
}

// 显示告警模态框, title为模态框标题，message为模态框内容
function showAlertModal(title, message) {
    var alertModal = $('#alertModal');
    alertModal.find('.modal-title').text(title);
    alertModal.find('.modal-body p').text(message);
    alertModal.modal('show');
}


function isEmpty(value) {
    return value == null || value === '' || value === 0;
}

// 图片点击
function imageClick(img) {
    //获取图片的src
    var src = $(img).attr('src');
    showimageModal(src);
}
//下载图片
$('#imagedownload').click(function () {
    var src = $('#create-image').attr('src');
    console.log("下载图片"+ src);
});

var errorContent = '<li><img class="img-responsive" src="images/ai50.png" alt="Avatar" style="width: 50px; height: 50px;"><p class="text-left">哎呀，出错了 请稍后再试</p></li>';


function send(){
    if(isEmpty(token)){
        showAlertModal('输入框校验', '未加载token功能不可用');
        return;
    }
    var question = $('#btn-input').val().trim();
    if (question) {
        var q_li = '<li>' +
            '<img class="img-responsive" src="images/git50.jpg" alt="Avatar" style="width: 50px; height: 50px;">' +
            '<p style="padding-left: 10px">' + question + '</p st></li>';
        $('#content-ul').append(q_li);
        var value = $('input[name="btnradio"]:checked').val();
        if(value === CHAT.image){
            imagesRequest(question);
        }else{
            textRequest(question);
        }
        $('#btn-input').val(''); // 清空输入框
    } else {
        showAlertModal('输入框校验', '请检查输入是否正确');
    }
}

function imagesRequest(question) {
    $.ajax({
        url: api_address + "/v1/images/generations",
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify({
            "prompt": question,
            "n": 1,
            "size": IMAGE.big
        }),
        success: function(response) {
            console.log(response);
            appendImage(response);
            scrollHeight();
        },
        error: function(error) {
            $('#content-ul').append(errorContent);
        }
    });
}


function textRequest(question) {
    $.ajax({
        url: api_address + "/v1/chat/completions",
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify({
            "model": MODEL.default,
            "messages": [
                {
                    "role": "user",
                    "content": question
                }
            ]
        }),
        success: function(response) {
            console.log(response);
            appendText(response);
            scrollHeight();
        },
        error: function(error) {
            $('#content-ul').append(errorContent);
        }
    });
}

function appendImage(response){
    var as;
    if(response.code !== 200){
        console.log(response.message);
        as = '哎呀，出错了 请稍后再试';
    }else{
        as = response.data.data[0].url;
    }
    var a_li = '<li>' +
        '<img class="img-responsive" src="images/ai50.png" alt="Avatar" style="width: 50px; height: 50px;">' +
        '<img class="img-responsive thumbnail" onclick="imageClick(this)" src="'+ as +'"alt="图片走丢了" style="width: 255px; height: 255px;"></li>';
    $('#content-ul').append(a_li);
}

function appendText(response){
    var answers;
    if(response.code !== 200){
        console.log(response.message);
        answers = '哎呀，出错了 请稍后再试';
    }else{
        var content;
        if(response.data.error === undefined){
            content = response.data.choices[0].message.content;
        }else{
            console.log(response.data.error);
            content = response.data.error.message;
        }
        answers = marked.parse(content);
    }
    var a_li = '<li>' +
        '<img class="img-responsive" src="images/ai50.png" alt="图片走丢了" style="width: 50px; height: 50px;">' +
        '<code id="markdown">' + answers + '</code></li>';
    $('#content-ul').append(a_li);
}

function scrollHeight(){
    var $ul = $('#content-ul'); // 通过id获取ul
    $ul.scrollTop($ul[0].scrollHeight); // 让滚动条自动下拉到最底部
}








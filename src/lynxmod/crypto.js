// -------- CRYPTO API -------- //

function convertStringToArrayBufferView(str)
{
    var bytes = new Uint8Array(str.length);
    for (var iii = 0; iii < str.length; iii++)
    {
        bytes[iii] = str.charCodeAt(iii);
    }
    return bytes;
}

function convertArrayBufferViewtoString(buffer)
{
    var str = "";
    for (var iii = 0; iii < buffer.byteLength; iii++)
    {
        str += String.fromCharCode(buffer[iii]);
    }

    return str;
}

async function create_key(user, password) {
	if(usersList.length != 0 && usersList[user] != undefined)
	{
		await crypto.subtle.digest({name: "SHA-256"}, convertStringToArrayBufferView(password)).then(async function(result){
		    await window.crypto.subtle.importKey("raw", result, {name: "AES-CBC"}, true, ["encrypt"]).then(async function(e){
		        await encrypt_data(user, password, e);
		    }, function(e){
		        console.log(e);
		    });
		
		});
	} else {
		console.log("user not found")
	}
}

async function encrypt_data(user, data, key)
{
	var vector = crypto.getRandomValues(new Uint8Array(16));
    await crypto.subtle.encrypt({name: "AES-CBC", iv: vector}, key, convertStringToArrayBufferView(data)).then(
        async function(result){
        	key = null;
        	usersList[user].password = JSON.parse(JSON.stringify(new Uint8Array(result)));
        	usersList[user].iv = vector;
        	vector = null;
        },
        function(e){
            console.log(e.message);
        }
    );
}      

var decrypted_data = null;

async function decrypt_data(user, password)
{
	decrypted_data = null;
	if(usersList.length != 0 && usersList[user] != undefined && usersList[user].password != undefined)
	{
		await crypto.subtle.digest({name: "SHA-256"}, convertStringToArrayBufferView(password)).then(async function(result){
			await crypto.subtle.importKey("raw", result, {name: "AES-CBC"}, true, ["decrypt"]).then(async function(result){
				var enc_password = usersList[user].password;
				var i = 0;for(var x in enc_password)i++;
				var encrypted_data =  new Uint8Array(i);
				for(i = 0; enc_password[i] != undefined; i++)
					encrypted_data[i] = enc_password[i];
				var vector = new Uint8Array(16);
				for(i = 0; usersList[user].iv[i] != undefined; i++)
					vector[i] = usersList[user].iv[i];
			    await crypto.subtle.decrypt({name: "AES-CBC", iv: vector}, result, encrypted_data).then(
			        async function(result){
			            decrypted_data = convertArrayBufferViewtoString(new Uint8Array(result));
			        },
			        function(e){
			            console.log(e.message);
			        });
				},
				function(e){
			        console.log(e.message);
				});
		},
		function(e){
	        console.log(e.message);
	    });
	} else {
		console.log("user not found")
	}
}
/**
 * Created by jw on 2017/6/5.
 */
import QuickEncrypt from './quick-encrypt/index'
import CryptoJS from 'crypto-js'

export default class Crypt {
    /**
     * Base64编码
     */
    static base64(str) {
        var wordArray = CryptoJS.enc.Utf8.parse(str);
        return CryptoJS.enc.Base64.stringify(wordArray);
    }

    /**
     * Base64解码
     */
    static base64Decode(base64) {
        var parsedWordArray = CryptoJS.enc.Base64.parse(base64);
        return parsedWordArray.toString(CryptoJS.enc.Utf8);
    }

    /**
     * 哈希
     */
    static hash(str) {
        return CryptoJS.SHA512(str).toString(CryptoJS.enc.Hex);
    }

    option = {
        iv: CryptoJS.enc.Utf8.parse('dqwimfcTyvjeCbprorSgl!x8Wvv'),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }
    /**
     * 对称加密
     *
     * @param data
     *            待加密内容
     * @param key
     *            必须为32位私钥
     * @returns {string}
     */
    static cipher(data, key) {
        return CryptoJS.AES.encrypt(data, key, this.option).toString();
    }

    /**
     * 对称解密
     *
     * @param data
     *            待解密内容
     * @param key
     *            必须为32位私钥
     * @returns {string}
     */
    static decipher(data, key, iv) {
        return CryptoJS.AES.decrypt(data, key, this.option).toString(CryptoJS.enc.Utf8);
    }

    // 非对称加密 
    static aymCrypter() {
        let keys = {
            "public": "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAjU4WsMGWdM9mVgYdCUghCS1DiBGI3aZ1WLL/GHGK3zKKeWF0BNhT2IBhsIWW\nGY/NY7z7IwicYbkiJjPmxostpsDyia8Va9iPjxYJrbew1MwIwUjfRgzxj7QIvWZIcFLZ9jhZ\nNv/T3RAzxSBcbny0xl2in8cZw57wWDkthsSEVMmZgEC6rgxT2k4HCA1Dbe6w3hQUApxT+wNF\nmw2IF1OqMQ8sPF4omJxuKadr1J7e6REm6HEo+fJihTMAsFfHGVaRNe13Lwoqe3ecESKQu2nR\nwXtSpKzpwWUyKbKuD5Qrp6Si2fYaCPcIjUy1B6Uv7lOdZqJugXGcAoGG+yCHS6Ue9QIDAQAB\n-----END RSA PUBLIC KEY-----\n",
            "private": ""
        }
        return class {
            // 加密
            static cipher(data) {
                return QuickEncrypt.encrypt(data, keys.public);
            }
            // 解密
            static decipher(data) {
                try {
                    return QuickEncrypt.decrypt(data, keys.private);
                } catch (e) {
                    //console.dir(e);
                    return null;
                }
            }
        };
    }

    static helper() {
        return class {
            static cipher(msg, mima, fields) {
                if (!mima || !fields) {
                    return msg;
                }
                if (typeof msg !== 'object')
                    return msg;
                for (const key in msg) {
                    const value = msg[key];
                    if (typeof value === 'string') {
                        if (fields.indexOf(key) > -1)
                            msg[key] = Crypt.cipher(value, mima);
                    } else if (typeof msg[key] === 'object') {
                        for (const k in value) {
                            if (fields.indexOf(k) > -1)
                                msg[key][k] = Crypt.cipher(value[k], mima);
                        }
                    }
                }
                return msg;
            }

            static decipher(msg, mima, fields) {
                if (!fields)
                    return msg;
                if (!mima) {
                    //console.log('密码为空!!!');
                    return msg;
                }
                if (typeof msg !== 'object')
                    return msg;
                for (const key in msg) {
                    const value = msg[key];
                    if (typeof value === 'string') {
                        if (fields.indexOf(key) > -1)
                            msg[key] = decipher(value, mima);
                    } else if (typeof msg[key] === 'object') {
                        for (const k in value) {
                            if (fields.indexOf(k) > -1)
                                msg[key][k] = decipher(value[k], mima);
                        }
                    }
                }
                return msg;

                function decipher(data, key) {
                    const msg = Crypt.decipher(data, key);
                    try {
                        return JSON.parse(msg);
                    } catch (err) {
                        return msg;
                    }
                }
            }
        };
    }
}



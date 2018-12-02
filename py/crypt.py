import hashlib

def qrcode_md5(package):
    m = hashlib.md5()
    m.update('%s-%s-%s-HARDCODE' % (package['_id'], package['activity'], package['createUser']))
    return m.hexdigest()

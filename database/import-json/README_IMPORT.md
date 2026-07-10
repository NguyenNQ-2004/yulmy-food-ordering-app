# Mongo Import JSON

Thu muc nay chua cac file JSON de import vao MongoDB local `yulmy_db`.

Tat ca file dung dang JSON array, nen import voi option `--jsonArray`.

## Thu Tu Import

Import theo thu tu nay de cac ObjectId reference khop nhau:

1. `users`
2. `restaurants`
3. `foods`
4. `vouchers`
5. `carts`
6. `orders`
7. `orderitems`
8. `payments`
9. `notifications`

## Lenh Import

Chay tai root project:

```powershell
mongoimport --db yulmy_db --collection users --file database/import-json/users.json --jsonArray
mongoimport --db yulmy_db --collection restaurants --file database/import-json/restaurants.json --jsonArray
mongoimport --db yulmy_db --collection foods --file database/import-json/foods.json --jsonArray
mongoimport --db yulmy_db --collection vouchers --file database/import-json/vouchers.json --jsonArray --mode upsert --upsertFields code
mongoimport --db yulmy_db --collection carts --file database/import-json/carts.json --jsonArray
mongoimport --db yulmy_db --collection orders --file database/import-json/orders.json --jsonArray
mongoimport --db yulmy_db --collection orderitems --file database/import-json/orderitems.json --jsonArray
mongoimport --db yulmy_db --collection payments --file database/import-json/payments.json --jsonArray
mongoimport --db yulmy_db --collection notifications --file database/import-json/notifications.json --jsonArray
```

Neu muon xoa du lieu cu cua tung collection truoc khi import, them `--drop`:

```powershell
mongoimport --db yulmy_db --collection users --file database/import-json/users.json --jsonArray --drop
```

## Tai Khoan Demo

Tat ca user demo dung mat khau:

```text
123456
```

Tai khoan co san:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `user@gmail.com` | `123456` |
| Admin | `admin@gmail.com` | `123456` |

## Ghi Chu

- File nay dung cho import truc tiep bang `mongoimport`, khong phai seed script Node.js.
- Cac field bo sung nhu `orderCode`, `receiverName`, `itemsAmount`, `deliveryFee`, `discountAmount`, `subtotal`, `paidAt` duoc them de ho tro flow cua Duy.
- Neu code backend chua cap nhat model, MongoDB van import duoc cac field nay. Khi code API, nen bo sung schema tuong ung de lam viec on dinh.


#!/bin/sh

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}


tempfile=curl.out.$$.tmp

# Users

status 'POST users/login returns success'
curl -H 'Content-Type: application/json' -o "$tempfile" -d '{
    "email": "nick@block15.com",
    "password": "hunter2"
    }' http://localhost:8000/users/login

cat "$tempfile"
token=$(awk -F'"token":"' '{print $2}' "$tempfile" | awk -F'"' '{print $1}')
rm -f "$tempfile"

auth="Authorization: $token"

status 'GET users/id succeeds'
curl -H "$auth" http://localhost:8000/users/1

status 'GET users/id fails if you are not the specified user'
curl -H "$auth" http://localhost:8000/users/2

status 'GET users/id/businesses succeeds'
curl -H "$auth" http://localhost:8000/users/1/businesses

status 'GET users/id/photos succceeds'
curl -H "$auth" http://localhost:8000/users/1/photos

status 'GET users/id/reviews fails for another user'
curl -H "$auth" http://localhost:8000/users/21/reviews

status 'GET users/id/reviews fails for another user'
curl -H "$auth" http://localhost:8000/users/21/reviews

# Businesses

status 'POST new business returns success'
curl -H 'Content-Type: application/json' -d '{
    "ownerId": 1,
    "name": "American Dream Pizza",
    "address": "2525 NW Monroe Ave.",
    "city": "Corvallis",
    "state": "OR",
    "zip": "97330",
    "phone": "541-757-1713",
    "category": "Restaurant",
    "subcategory": "Pizza",
    "website": "http://adpizza.com"
    }' http://localhost:8000/businesses

status 'GET business-by-id should return success'
curl http://localhost:8000/businesses/2

status 'POST new business returns failure with missing parameters'
curl -H 'Content-Type: application/json' -d '{
    "name": "Ice Cream Bozos",
    "street": "1764 Axis St",
    "city": "Redmond",
    "state": "Oregon",
    "zip": "97756",
    "phone_number": "000-111-2222"
    }' http://localhost:8000/businesses

status 'GET businesses returns page 1'
curl http://localhost:8000/businesses

status 'PUT business returns success'
curl -X PUT http://localhost:8000/businesses/1 -H 'Content-Type: application/json' -d '{
    "name": "Super! Ice Cream Bozos",
    "street": "Freezer Cir"
    }' 

status 'DELETE business succeeds'
curl -X DELETE http://localhost:8000/businesses/1 -H 'Content-Type: application/json'


# Reviews

status 'POST new reviews returns success'
curl -H 'Content-Type: application/json' -d '{
    "business_id": 1,
    "user_id": 1,
    "stars": 5,
    "cost": 3,
    "description": "Good ice cream!"
    }' http://localhost:8000/reviews

status 'GET reviews/id succeeds'
curl http://localhost:8000/reviews/1

status 'GET reviews suceeds'
curl http://localhost:8000/reviews

status 'GET reviews?page=2 suceeds'
curl http://localhost:8000/reviews?page=2

status 'PUT reviews succeeds'
curl -X PUT http://localhost:8000/reviews/1 -H 'Content-Type: application/json' -d '{
    "stars": 1,
    "description": "Sucks actually"
    }' 
curl http://localhost:8000/reviews/1

status 'DELETE reviews succeeds'
curl -X DELETE http://localhost:8000/reviews/1 -H 'Content-Type: application/json'

# Photos

status 'POST new photos returns success'
curl -H 'Content-Type: application/json' -d '{
    "business_id": 1,
    "user_id": 1,
    "caption": "Ice crem",
    "img_URL": "www.pixels.com/myphoto"
    }' http://localhost:8000/photos

status 'GET photos/id succeeds'
curl http://localhost:8000/photos/1

status 'GET photos succeeds'
curl http://localhost:8000/photos

status 'PUT photos succeeds'
curl -X PUT http://localhost:8000/photos/1 -H 'Content-Type: application/json' -d '{
    "caption": "Subscribe to my youtuber at..."
    }' 
curl http://localhost:8000/photos/1

status 'DELETE photos suceeds'
curl -X DELETE http://localhost:8000/photos/1 -H 'Content-Type: application/json'
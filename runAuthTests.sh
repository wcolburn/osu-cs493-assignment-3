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
curl -H 'Content-Type: application/json' -H "$auth" -d '{
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

status 'POST new business fails if the wrong user'
curl -H 'Content-Type: application/json' -H "$auth" -d '{
    "ownerId": 5,
    "name": "American GROSS Pizza",
    "address": "2525 NW Monroe Ave.",
    "city": "Corvallis",
    "state": "OR",
    "zip": "97330",
    "phone": "541-757-1713",
    "category": "Restaurant",
    "subcategory": "Pizza",
    "website": "http://adpizza.com"
    }' http://localhost:8000/businesses

status 'PATCH business succeeds'
curl -X PATCH http://localhost:8000/businesses/1 -H 'Content-Type: application/json' -H "$auth" -d '{
    "name": "Worse business",
    "phone": "000-000-0100"
    }' 

status 'PATCH business fails for another user'
curl -X PATCH http://localhost:8000/businesses/5 -H 'Content-Type: application/json' -H "$auth" -d '{
    "name": "Worse business again",
    "phone": "000-000-0101"
    }' 


# Reviews

status 'POST new reviews returns success'
curl -H 'Content-Type: application/json' -H "$auth" -d '{
    "businessId": 1,
    "userId": 1,
    "stars": 5,
    "dollars": 3,
    "review": "Good ice cream!"
    }' http://localhost:8000/reviews

status 'POST new reviews fails for another user'
curl -H 'Content-Type: application/json' -H "$auth" -d '{
    "businessId": 5,
    "userId": 5,
    "stars": 2,
    "dollars": 1,
    "review": "Bleh.. ice cream"
    }' http://localhost:8000/reviews

status 'PATCH reviews succeeds'
curl -X PATCH http://localhost:8000/reviews/11 -H 'Content-Type: application/json' -H "$auth" -d '{
    "userID": 1,
    "stars": 1,
    "review": "Sucks actually"
    }' 

status 'PATCH reviews fails for another user'
curl -X PATCH http://localhost:8000/reviews/11 -H 'Content-Type: application/json' -H "$auth" -d '{
    "userID": 5,
    "stars": 4,
    "review": "I totes love it!"
    }' 


# Photos

status 'POST new photos returns success'
curl -H 'Content-Type: application/json' -H "$auth" -d '{
    "businessId": 1,
    "userId": 1,
    "caption": "Ice crem"
    }' http://localhost:8000/photos

status 'POST new photos fails if another user'
curl -H 'Content-Type: application/json' -H "$auth" -d '{
    "businessId": 5,
    "userId": 5,
    "caption": "Banana"
    }' http://localhost:8000/photos


# DELETES

status 'DELETE reviews succeeds'
curl -X DELETE http://localhost:8000/reviews/11 -H 'Content-Type: application/json' -H "$auth"

status 'DELETE reviews fails for another user'
curl -X DELETE http://localhost:8000/reviews/5 -H 'Content-Type: application/json' -H "$auth"

status 'DELETE business succeeds'
curl -X DELETE http://localhost:8000/businesses/1 -H 'Content-Type: application/json' -H "$auth"

status 'DELETE reviews fails for another user'
curl -X DELETE http://localhost:8000/businesses/5 -H 'Content-Type: application/json' -H "$auth"
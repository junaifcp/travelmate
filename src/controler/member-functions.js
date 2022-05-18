
const Member=require('../models/member-register')
const db=require('../db/conn')
const Razorpay=require('razorpay');
const JWT=require('jsonwebtoken')
const axios = require("axios");
// const { jwt } = require('twilio');
var instance = new Razorpay({
    key_id: 'rzp_test_SpVVwPPJ2Lq1Zq',
    key_secret: '7syibOfoCsPHURLwxfm8eJge',
  });

module.exports={
    getAllMembers:()=>{
        return new Promise(async(resolve,reject)=>{
            let members=await Member.find().sort({createdAt:-1}).limit(6).lean()
            resolve(members)
        })
    },
    getPaginated:(page,limit)=>{
        return new Promise(async(resolve,reject)=>{
            let members=await Member.paginate({},{page:page,limit:limit})
            resolve(members)
        })
    },
    generateRazorPay:(orderId,member)=>{
        return new Promise((resolve,reject)=>{
            let amount=member.amountPay*100
             var options = {
                amount: amount,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId
              };
              instance.orders.create(options, function(err, order) {
                  if(err){
                      console.log(err);
                  }else{
              
               resolve(order)
                  }
              });
        })
    },
    paymentVerify:(details)=>{
        return new Promise((resolve,reject)=>{
         
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256','7syibOfoCsPHURLwxfm8eJge')
            hmac.update(details['payment[razorpay_order_id]']+'|'+ details['payment[razorpay_payment_id]'])

            hmac = hmac.digest('hex')
            console.log("hmac"+hmac);
            console.log("signature"+details['payment[razorpay_signature]']);
            if (hmac==details['payment[razorpay_signature]']) {
                console.log("resolve");
                resolve(details)
            } else {
                console.log("reject");
                reject()
            }
        })
    },
    signAccessToken:(admin)=>{
            return new Promise((resolve,reject)=>{
                const payload={
                    name:"Junaif",

                }
                const secret=process.env.SECRET_KEY;
                const options={};
                JWT.sign(payload,secret,options,(err,token)=>{
                    if(err)reject(err)
                    resolve(token)
                })
            })
    },
    findHotelCoords:(cityName)=>{
       return new Promise((resolve,reject)=>{
        const options = {
            method: 'GET',
            url: 'https://booking-com.p.rapidapi.com/v1/hotels/locations',
            params: {locale: 'en-gb', name:cityName},
            headers: {
              'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
              'X-RapidAPI-Key': process.env.RAPID_API
            }
          };
          
          axios.request(options).then(function (response) {
         
            const coords={
                lat:response.data[0].latitude,
                lng:response.data[0].longitude
            }
             resolve(coords)
          }).catch(function (error) {
              console.error(error);
          });
       })
    },
    findHotels:(data)=>{
        console.log("entered>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
      
        return new Promise((resolve,reject)=>{
            const options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/nearby-cities',
                params: {latitude: data.lat, longitude: data.lng, locale: 'en-gb'},
                headers: {
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
                  'X-RapidAPI-Key': process.env.RAPID_API
                }
              };
              
              axios.request(options).then(function (response){
                
               resolve(response.data[0])
              }).catch(function (error) {
                  console.error(error);
              });
        })
    },
    hotelId:(data)=>{
        return new Promise((resolve,reject)=>{
            const options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/search',
                params: {
                  checkout_date: data.checkout,
                  units: 'metric',
                  dest_id: data.dest_id,
                  dest_type: 'city',
                  locale: 'en-gb',
                  adults_number: '2',
                  order_by: 'popularity',
                  filter_by_currency: 'INR',
                  checkin_date: data.checkin,
                  room_number: '1',
                  children_number: '2',
                  page_number: '0',
                  children_ages: '5,0',
                  categories_filter_ids: 'class::2,class::4,free_cancellation::1',
                  include_adjacency: 'true'
                },
                headers: {
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
                  'X-RapidAPI-Key': process.env.RAPID_API
                }
              };              
              axios.request(options).then(function (response) {
                //   console.log(response.data);
                  resolve(response.data)
              }).catch(function (error) {
                  console.error(error);
              });
        })
    },
    findById:(hotel_id)=>{
        return new Promise((resolve,reject)=>{
            const options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/photos',
                params: {locale: 'en-gb', hotel_id: hotel_id},
                headers: {
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
                  'X-RapidAPI-Key': process.env.RAPID_API
                }
              };
              
              axios.request(options).then(function (response) {
                //   console.log(response.data);
                  resolve(response.data)
              }).catch(function (error) {
                  console.error(error+"first error");
              });
        })
    },
    hotelDesc:(hotel_id)=>{
        return new Promise((resolve,reject)=>{
            const options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/description',
                params: {hotel_id: hotel_id, locale: 'en-gb'},
                headers: {
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
                  'X-RapidAPI-Key': process.env.RAPID_API
                }
              };
              
              axios.request(options).then(function (response) {
                //   console.log(response.data);
                  resolve(response.data)
              }).catch(function (error) {
                  console.error("second error"+error);
              });
        })
    },
    hotelReviews:(hotel_id)=>{
        return new Promise((resolve,reject)=>{
            const options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/data',
                params: {hotel_id: hotel_id, locale: 'en-gb'},
                headers: {
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
                  'X-RapidAPI-Key': process.env.RAPID_API
                }
              };
              
              
              axios.request(options).then(function (response) {
                //   console.log(response.data);
                  resolve(response.data)
              }).catch(function (error) {
                  console.error("third error"+error);
              });
        })
    },
    nearbyPlaces:(hotel_id)=>{
        return new Promise((resolve,reject)=>{
            const options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/nearby-places',
                params: {hotel_id: hotel_id, locale: 'en-gb'},
                headers: {
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
                  'X-RapidAPI-Key': process.env.RAPID_API
                }
              };
              
              axios.request(options).then(function (response) {
                //   console.log(response.data);
                  resolve(response.data)
              }).catch(function (error) {
                  console.error("fourth error"+error);
              });
        })
    },
    hotelMap:(hotel_id)=>{
        return new Promise((resolve,reject)=>{
            const options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/map-markers',
                params: {locale: 'en-gb', hotel_id: hotel_id},
                headers: {
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
                  'X-RapidAPI-Key': process.env.RAPID_API
                }
              };
              
              axios.request(options).then(function (response) {
                //   console.log(response.data);
                  resolve(response.data)
              }).catch(function (error) {
                  console.error("fifth error"+error);
              });
        })
    }
  }

  // let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

    // var crypto = require("crypto");
    // var expectedSignature = crypto.createHmac('sha256', 'nVY3OyfLVJhpSvF3siqdZamo')
    //                                 .update(body.toString())
    //                                 .digest('hex');
    //                                 console.log("sig received " ,req.body.response.razorpay_signature);
    //                                 console.log("sig generated " ,expectedSignature);
    // var response = {"signatureIsValid":"false"}
    // if(expectedSignature === req.body.response.razorpay_signature)
    //  response={"signatureIsValid":"true"}
    //     res.send(response);
//   <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
//                         <div class="room-item shadow rounded overflow-hidden">
//                             <div class="position-relative">
//                                 <img class="img-fluid" id="img-card" src="/uploads/{{#each this}}{{this.profilePicId}}{{/each}}" alt="">   
//                             </div>
//                             <div class="p-4 mt-2">
                               
//                                 <div class="d-flex mb-3">
// 									{{#if postCount}}
//                                     <small class="border-end me-3 pe-3"><i class="fa fa-folder mx-2"></i>{{#each this}}{{this.postCount}}{{/each}}&nbsp;Posts</small>
// 									{{/if}}
// 									{{#if feedbacks}}
								
//                                     <small class="border-end me-3 pe-3"><i class="fa fa-comments mx-2"></i>{{feedCount feedbacks}}&nbsp;feedbacks</small>
						
// 									{{/if}}
//                                     <small class="fa fa-star text-primary px-4">4/5</small>
//                                 </div>
// 								<h3><a href="#">{{#each this}}{{this.userName}}{{/each}}&nbsp;|&nbsp;{{#each this}}{{this.state}}{{/each}}</a></h3>
//                                 <p class="text-body mb-3">{{#each this}}{{bio}}{{/each}}...</p>
//                                 <div class="d-flex justify-content-between">
//                                     <a class="btn btn-sm btn-primary rounded py-2 px-4" href="/member/{{_id}}">Show profile</a>
//                                     <a class="btn btn-sm btn-dark rounded py-2 px-4" href="/members/contact/{{_id}}">Contact Now</a>
//                                 </div>
//                             </div>
//                         </div>
// 					</div>  


// let body= details['payment[razorpay_order_id]']+ "|" + details['payment[razorpay_payment_id]']
// var crypto = require("crypto");
// var expectedSignature = crypto.createHmac('sha256', 'nVY3OyfLVJhpSvF3siqdZamo')
//                                      .digest('hex');
//                                     console.log("sig received " + details['payment[razorpay_signature]']);
//                                      console.log("sig generated " + expectedSignature);
//                                     var response = {"signatureIsValid":"false"}
// if(expectedSignature === details['payment[razorpay_signature]']){
//     response={"signatureIsValid":"true"}
//     console.log("resolved");
//     resolve()
// }
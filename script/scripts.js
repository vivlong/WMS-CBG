"use strict";
var app = angular.module( "yapp", [ "configs", "ui.router", "ui.bootstrap", "ngMessages", "ngAnimate", "firebase", "firebase.ref", "firebase.auth", "door3.css", "smoothScroll", "angular-click-outside", "ngSanitize", "angularMoment", "ngIntercom", "xeditable", "angular-select-text", "angular-svg-round-progress" ] ).config( [ "$stateProvider", "$urlRouterProvider", function( e, a ) {
    a.when( "/dashboard", "/dashboard/cards" ), a.otherwise( "/" ), e.state( "base", {
        "abstract": !0,
        url: "",
        templateUrl: "views/base.html",
        authenticate: !1
    } ).state( "landing", {
        url: "/",
        templateUrl: "views/landing.html",
        authenticate: !1,
        controller: "LandingCtrl"
    } ).state( "login", {
        url: "/login",
        parent: "base",
        templateUrl: "views/login.html",
        controller: "LoginCtrl",
        authenticate: !1
    } ).state( "terms", {
        url: "/terms",
        parent: "base",
        templateUrl: "views/terms.html",
        controller: "LandingCtrl",
        authenticate: !1
    } ).state( "faq", {
        url: "/faq?open",
        parent: "base",
        templateUrl: "views/faq.html",
        controller: "LandingCtrl",
        authenticate: !1
    } ).state( "privacy", {
        url: "/privacy",
        parent: "base",
        templateUrl: "views/privacy.html",
        controller: "LandingCtrl",
        authenticate: !1
    } ).state( "reset", {
        url: "/reset",
        parent: "base",
        templateUrl: "views/reset.html",
        controller: "LoginCtrl",
        authenticate: !1
    } ).state( "updatepassword", {
        url: "/updatepassword",
        parent: "base",
        templateUrl: "views/updatepassword.html",
        controller: "UpdatePasswordCtrl",
        authenticate: !0
    } ).state( "beta", {
        url: "/beta",
        templateUrl: "views/beta.html",
        controller: "DashboardCtrl",
        authenticate: !1
    } ).state( "register", {
        url: "/register-alpha",
        parent: "base",
        templateUrl: "views/register.html",
        controller: "RegisterCtrl",
        authenticate: !1
    } ).state( "dashboard", {
        url: "/dashboard",
        parent: "base",
        templateUrl: "views/dashboard.html",
        controller: "DashboardCtrl",
        authenticate: !0
    } ).state( "cards", {
        url: "/cards",
        parent: "dashboard",
        templateUrl: "views/dashboard/cards.html",
        authenticate: !0
    } ).state( "fees", {
        url: "/fees",
        parent: "dashboard",
        templateUrl: "views/dashboard/fees.html",
        controller: "FeesAndLimitsCtrl",
        authenticate: !0
    } ).state( "limits", {
        url: "/limits",
        parent: "dashboard",
        templateUrl: "views/dashboard/limits.html",
        controller: "FeesAndLimitsCtrl",
        authenticate: !0
    } ).state( "cardDetails", {
        url: "/cards/:id",
        parent: "dashboard",
        templateUrl: "views/dashboard/cardDetails.html",
        controller: "CardDetailCtrl",
        authenticate: !0
    } ).state( "account", {
        url: "/account",
        parent: "dashboard",
        templateUrl: "views/dashboard/account.html",
        controller: "AccountCtrl",
        authenticate: !0
    } )
} ] ).run( [ "$intercom", "$rootScope", "$firebaseObject", "$state", "$stateParams", "Auth", "DAO", function( e, a, t, n, r, i, o ) {
    if ( a.$on( "$stateChangeStart", function( a, t, r ) {
            if ( t.authenticate && !i.$getAuth() ) n.transitionTo( "login" ), a.preventDefault();
            else if ( t.authenticate && i.$getAuth() && "cardDetails" === t.name ) {
                var d = o.cardDetailsObj( r.id, i.$getAuth().uid );
                d.$loaded().then( function() {
                    "active" === d.status && ( o.updateBalanceTransactions( r.id, i.$getAuth().uid ), e.trackEvent( "Viewing card details page", {
                        "card id": r.id
                    } ) )
                } )
            }
        } ), i.$getAuth() ) {
        var d = o.userData( i.$getAuth().uid );
        d.$loaded().then( function() {
            e.boot( {
                email: d.email,
                user_id: i.$getAuth().uid,
                last_request_at: Math.round( ( new Date ).getTime() / 1e3 ),
                name: d.firstName + " " + d.lastName,
                widget: {
                    activator: "#IntercomDefaultWidget"
                }
            } )
        } )
    }
} ] ).config( [ "$intercomProvider", "INTERCOM_APPID", function( e, a ) {
    e.appID( a ), e.asyncLoading( !0 )
} ] ).constant( "MinimumLoad", 500 );
angular.module( "configs", [] ).constant( "FBURL", "https://shakepay.firebaseio.com" ).constant( "CardDetailsAPI", "https://shake-api.azurewebsites.net" ).constant( "INTERCOM_APPID", "vc0sjajb" ).constant( "BlockchainUrl", "https://blockchain.info/tx/" ), app.controller( "AccountCtrl", [ "$firebaseObject", "$scope", "$state", "Auth", "DAO", function( e, a, t, n, r ) {
        a.$state = t, a.userData = r.userData( n.$getAuth().uid );
        var i = r.userNotificationData( n.$getAuth().uid );
        i.$bindTo( a, "notificationData" )
    } ] ), angular.module( "yapp" ).controller( "LoginCtrl", [ "$scope", "$intercom", "$state", "Auth", function( e, a, t, n ) {
        function r() {
            n.$getAuth().password.isTemporaryPassword ? t.go( "updatepassword" ) : t.go( "cards" )
        }

        function i() {
            e.err = "There was an error with your email or password."
        }
        n.$getAuth() && t.go( "cards" ), e.passwordLogin = function( t, o ) {
            e.err = null, n.$authWithPassword( {
                email: t,
                password: o
            }, {
                rememberMe: !0
            } ).then( r, i ).then( function() {
                a.boot( {
                    user_id: n.$getAuth().uid
                } ), a.trackEvent( "logged in" )
            } )
        }, e.passwordReset = function( a ) {
            n.$resetPassword( {
                email: a
            } ).then( function() {
                e.err = "Password reset. Please check your email."
            } )[ "catch" ]( function() {
                e.err = "This email does not exist."
            } )
        }
    } ] ), angular.module( "yapp" ).controller( "DashboardCtrl", [ "$scope", "$state", "$modal", "$http", "$firebaseArray", "$firebaseObject", "$intercom", "$timeout", "Alerts", "Auth", "DAO", "Ref", "util", function( e, a, t, n, r, i, o, d, s, c, l, u, m ) {
        e.$state = a;
        var h = l.userData( c.$getAuth().uid );
        e.userData = h;
        var p = {};
        h.$loaded().then( function() {
            p = angular.fromJson( angular.toJson( h ) )
        } );
        var f = r( u.child( "users" ).child( c.$getAuth().uid ).child( "cards" ) );
        e.firebaseLoading = !0, f.$loaded().then( function() {
            e.firebaseLoading = !1, e.cards = f
        } );
        var g = r( u.child( "users" ).child( c.$getAuth().uid ).child( "alerts" ) );
        e.alerts = g, e.deleteAlert = function( e ) {
            s[ "delete" ]( e, c.$getAuth().uid )
        }, e.logout = function() {
            o.trackEvent( "Logged out" ), c.$unauth(), a.go( "landing" ), o.shutdown()
        }, e.addCardModal = function( e ) {
            "verified" === e && t.open( {
                templateUrl: "../views/modals/addCardModal.html",
                controller: "AddCardCtrl",
                size: "sm"
            } )
        }, e.createFirstCard = function() {
            t.open( {
                templateUrl: "../views/modals/createFirstCard.html",
                controller: "CreateFirstCardCtrl",
                size: "md"
            } )
        }, e.formatAmount = function( e ) {
            return m.formatAmount( e )
        }, e.saveUserInfo = function() {
            o.trackEvent( "Updated user info" );
            var a = [ "firstName", "middleName", "lastName", "phoneNumber", "dateOfBirth" ],
                t = [ "address1", "address2", "city", "fedDistrict", "city", "country", "zipCode" ],
                n = null,
                r = u.child( "users" ).child( c.$getAuth().uid ).child( "data" );
            for ( n = 0; n < a.length; n++ )
                if ( p[ a[ n ] ] !== e.userData[ a[ n ] ] ) {
                    var i = {};
                    i[ a[ n ] ] = e.userData[ a[ n ] ], r.update( i ), p[ a[ n ] ] = e.userData[ a[ n ] ]
                }
            for ( n = 0; n < t.length; n++ )
                if ( p.address[ t[ n ] ] !== e.userData.address[ t[ n ] ] ) {
                    var d = {};
                    d[ t[ n ] ] = e.userData.address[ t[ n ] ], r.child( "address" ).update( d ), p.address[ t[ n ] ] = e.userData.address[ t[ n ] ]
                }
        }
    } ] ), app.controller( "CardDetailCtrl", [ "$scope", "$state", "$stateParams", "$modal", "$http", "$firebaseArray", "$firebaseObject", "$intercom", "$timeout", "Alerts", "Auth", "BlockchainUrl", "CardDetailsAPI", "constants", "DAO", "Ref", "util", function( e, a, t, n, r, i, o, d, s, c, l, u, m, h, p, f, g ) {
        e.firebaseLoading = !0;
        var b = t.id,
            v = p.userData( l.$getAuth().uid );
        e.userData = v, e.unconfirmedPriceHandler = function( e ) {
            var a = g.subtractCommission( h.commission(), g.dollarsToCents( e ) );
            return g.twoDecimals( g.centsToDollars( a ) )
        }, e.cardData = o( f.child( "users" ).child( l.$getAuth().uid ).child( "cards" ).child( b ) ), e.cardData.$loaded().then( function() {
            e.firebaseLoading = !1
        } );
        var y = i( f.child( "users" ).child( l.$getAuth().uid ).child( "alerts" ) );
        e.alerts = y, e.deleteAlert = function( e ) {
            c[ "delete" ]( e, l.$getAuth().uid )
        }, e.logout = function() {
            d.trackEvent( "Logged out" ), l.$unauth(), a.go( "landing" ), d.shutdown()
        }, e.addFunds = function() {
            d.trackEvent( "Initiated add funds" );
            var a = function( a, t ) {
                n.open( {
                    templateUrl: "../views/modals/fundsModal.html",
                    controller: "FundsModalCtrl",
                    size: "sm",
                    resolve: {
                        fundsObject: function() {
                            return {
                                status: a,
                                lastInvoice: t,
                                cardId: b,
                                cardData: e.cardData
                            }
                        }
                    }
                } )
            };
            a( "createInvoice", "" )
        }, e.showCard = function() {
            function a( e ) {
                for ( var a = String( e ).split( "" ), t = -4; a.length + t > 0; ) a.splice( t, 0, " " ), t -= 5;
                return a.join( "" )
            }
            d.trackEvent( "Viewed card details popup" ), e.cardLoading = '<i class="fa fa-refresh fa-spin fast-spin"></i>';
            var t = {
                method: "POST",
                url: m,
                data: {
                    token: l.$getAuth().token,
                    cardId: b,
                    uid: l.$getAuth().uid
                }
            };
            r( t ).success( function( t ) {
                t.pan = a( t.pan ), e.thisCard = t, e.cardLoading = null, e.openCard = !0
            } ).error( function() {
                e.cardLoading = null, c.create( "warning", "There was an error processing your request.", !0, l.$getAuth().uid )
            } )
        }, e.closeCard = function() {
            e.openCard = !1, s( function() {
                e.flip = !1
            }, 1e3 )
        }, e.rotate = function( a ) {
            e.flip = a, d.trackEvent( "Flipped card" )
        }, e.saveCardLabel = function( e ) {
            var a = {
                label: e
            };
            p.saveCardLabel( a, b, l.$getAuth().uid ), d.trackEvent( "Edited card label" )
        }, e.formatAmount = function( e ) {
            return g.formatAmount( e )
        }, e.transactionDescriptionHandler = function( e ) {
            return e.description && "Value Load" !== e.description ? e.description : "Value Load" === e.description || "Shake Pay" === e.merchantName ? "Shake — Card load" : e.merchantName && "Shake Pay" !== e.merchantName ? e.merchantName : e.comment
        }, e.currentPage = 1, e.transactions = p.cardTransactions( b, l.$getAuth().uid ), e.invoices = p.cardInvoices( b, l.$getAuth().uid ), e.blockchainLink = function( e ) {
            return u + e
        }
    } ] ).filter( "startFrom", function() {
        return function( e, a ) {
            return a = +a, e.slice( a )
        }
    } ).filter( "reverse", function() {
        return function( e ) {
            return e.slice().reverse()
        }
    } ).filter( "with", function() {
        return function( e, a ) {
            var t = {};
            return angular.forEach( e, function( e, n ) {
                e.hasOwnProperty( a ) || ( t[ n ] = e )
            } ), t
        }
    } ), angular.module( "yapp" ).controller( "RegisterCtrl", [ "$intercom", "$scope", "$state", "$timeout", "$q", "Auth", "Alerts", "Ref", function( e, a, t, n, r, i, o, d ) {
        function s() {
            t.go( "cards" )
        }

        function c( e ) {
            "EMAIL_TAKEN" === e.code ? a.err = "This email already has an account on Shake. Would you like to recover your password?" : "INVALID_EMAIL" === e.code ? a.err = "This email is invalid. Please enter a valid email address." : "PERMISSION_DENIED" === e.code && ( a.err = "You are not on the alpha user list. If you would like to join, please contact alpha@shakepay.co." ), a.$apply()
        }
        i.$getAuth() && t.go( "cards" ), a.createAccount = function( t, o, l ) {
            function u( a ) {
                var t = d.child( "users" ).child( a.uid ),
                    o = r.defer();
                return t.child( "data" ).set( {
                    email: m,
                    notifications: {
                        email: {
                            declined: !1,
                            loaded: !1,
                            spent: !1,
                            created: !1,
                            refunded: !1
                        },
                        sms: {
                            declined: !0,
                            loaded: !0,
                            spent: !0,
                            created: !0,
                            refunded: !0
                        }
                    }
                }, function( e ) {
                    n( function() {
                        e ? o.reject( e ) : o.resolve( t )
                    } )
                } ), e.boot( {
                    name: m,
                    email: m,
                    user_id: i.$getAuth().uid,
                    signed_up_at: Math.round( ( new Date ).getTime() / 1e3 )
                } ), o.promise
            }
            var m = t.toLowerCase();
            a.err = null, m ? o ? o !== l ? a.err = "Passwords do not match" : o.length < 6 ? a.err = "Password must be longer than 6 characters" : d.child( "probeAddUser" ).push( {
                email: m
            }, function( e ) {
                e ? c( e ) : i.$createUser( {
                    email: m,
                    password: o
                } ).then( function() {
                    return i.$authWithPassword( {
                        email: m,
                        password: o
                    }, {
                        rememberMe: !0
                    } )
                } ).then( u ).then( s, c )
            } ) : a.err = "Please enter a password" : a.err = "Please enter a valid email address"
        }
    } ] ), angular.module( "yapp" ).controller( "FundsModalCtrl", [ "$scope", "$http", "$modalInstance", "$intercom", "$timeout", "$window", "fundsObject", "Auth", "constants", "MinimumLoad", "moment", "Ref", "util", function( e, a, t, n, r, i, o, d, s, c, l, u, m ) {
        e.status = o.status, e.invoice = o.lastInvoice, e.feeHandler = function( e ) {
            if ( e ) {
                var a = m.addCommission( s.commission(), m.dollarsToCents( e ) );
                return m.twoDecimals( m.centsToDollars( a ) )
            }
            return null
        };
        var h = s.cardLimits( o.cardData.currency );
        e.availableCurrencies = [ {
            name: o.cardData.currency,
            value: o.cardData.currency
        } ], e.currency = e.availableCurrencies[ 0 ].value, e.payInvoice = function() {
            i.location.href = e.invoice.url
        };
        var p = function( e ) {
            var a = String( e ).split( /[.]/ );
            return a[ 1 ] > 99
        };
        e.submit = function() {
            if ( e.amount || ( e.amount = 10 ), p( e.amount ) ) e.err = "Only two decimal places allowed.";
            else if ( m.dollarsToCents( e.amount ) > h ) e.err = "Limit of " + o.cardData.currency + " " + h + " per card";
            else if ( m.dollarsToCents( e.amount ) < c ) e.err = "Minimum of " + o.cardData.currency + " 5 per card";
            else if ( m.dollarsToCents( e.amount ) )
                if ( m.dollarsToCents( e.amount ) + o.cardData.cumulativeLoad > h ) e.err = "Adding " + e.currency + " " + e.amount + " will push you over the limit of " + o.cardData.currency + " " + h + " per card. Please upgrade your account to KYC Level 2 in the 'My account' to enable unlimited card loading.";
                else {
                    e.err = null;
                    var a = u.child( "loadQueue" ).child( "tasks" ),
                        t = u.child( "users" ).child( d.$getAuth().uid ).child( "cards" ).child( o.cardId ).child( "invoices" ),
                        s = l().format( "x" ) + d.$getAuth().uid;
                    t.on( "child_added", function( a ) {
                        a.val().requestId === s && ( e.status = "redirecting", n.trackEvent( "Sending user to invoice", {
                            amount: a.val().currency + " " + a.val().price,
                            "invoice id": a.val().id,
                            "bitpay url": a.val().url,
                            "invoice created at": l( a.val().invoiceTime ).format( "YYYY-MMM-DD HH:mm" )
                        } ), r( function() {
                            i.location.href = a.val().url
                        }, 1500 ) )
                    } ), a.push( {
                        cardId: o.cardId,
                        currency: e.currency,
                        amount: m.dollarsToCents( e.amount ),
                        uid: d.$getAuth().uid,
                        requestId: s
                    } ), e.status = "loading"
                }
            else e.err = "Please enter an amount to be loaded on your new card."
        }, e.cancel = function() {
            t.close()
        }
    } ] ), angular.module( "yapp" ).controller( "FeesAndLimitsCtrl", [ "$firebaseObject", "$scope", "$state", "Auth", "DAO", function( e, a, t, n, r ) {
        a.$state = t, a.userData = r.userData( n.$getAuth().uid ), a.feesArray = [ {
            description: "Card creation",
            frequency: "once",
            amount: "free*"
        }, {
            description: "Loading card",
            frequency: "per transaction",
            amount: "1%"
        }, {
            description: "Foreign Currency Conversion",
            frequency: "per transaction",
            amount: "3%"
        }, {
            description: "Redemption of unused funds",
            frequency: "per request",
            amount: "$ 10.00"
        } ], a.rulesArray = [ {
            description: "Number of purchases",
            frequency: "per day",
            kycLevel1: "no limit",
            kycLevel2: "no limit"
        }, {
            description: "Value of purchases",
            frequency: "per day",
            kycLevel1: "no limit",
            kycLevel2: "no limit"
        }, {
            description: "Maximum single load",
            frequency: "per load",
            kycLevel1: "2,500",
            kycLevel2: "10,000"
        }, {
            description: "Maximum load",
            frequency: "per day",
            kycLevel1: "2,500",
            kycLevel2: "20,000"
        }, {
            description: "Maximum lifetime load",
            frequency: "per card",
            kycLevel1: "2,500",
            kycLevel2: "no limit"
        } ]
    } ] ), angular.module( "yapp" ).controller( "CreateFirstCardCtrl", [ "$scope", "$http", "$intercom", "$modalInstance", "$state", "Auth", "Alerts", "constants", "Ref", function( e, a, t, n, r, i, o, d, s ) {
        function c( e ) {
            var a = e.split( "+" );
            return a[ 1 ]
        }
        var l = function( e ) {
            return 10 > e ? "0" + e : "" + e
        };
        e.submit = function() {
            var a = s.child( "users" ).child( i.$getAuth().uid ).child( "data" ),
                o = s.child( "users" ).child( i.$getAuth().uid ).child( "cards" );
            a.update( {
                firstName: e.firstName,
                lastName: e.lastName,
                dateOfBirth: e.dob.yyyy + "-" + l( e.dob.mm ) + "-" + l( e.dob.dd ),
                phoneNumber: c( e.phoneNumber ),
                kycLevel: 1,
                address: {
                    address1: e.address1,
                    city: e.city,
                    zipCode: e.zipCode,
                    country: e.country
                }
            }, function( a ) {
                if ( a ) console.log( a );
                else {
                    t.trackEvent( "Created " + e.currency + " card" );
                    var d = o.push( {
                        label: e.cardLabel,
                        currency: e.currency,
                        status: "unissued",
                        timestamp: Firebase.ServerValue.TIMESTAMP
                    } );
                    n.close(), t.update( {
                        user_id: i.$getAuth().uid,
                        card_id: d.key()
                    } ), r.go( "cardDetails", {
                        id: d.key()
                    } )
                }
            } )
        }, e.hideAlert = function() {
            e.hideAlertToggle = !0
        }, e.cancel = function() {
            n.close()
        }, e.openDate = function() {
            e.dateStatus.opened = !0
        }, e.currencies = d.currencies(), e.countries = d.countries(), e.regex = {
            phoneNumber: "\\+\\d{10,15}",
            zipCode: "[A-Za-z\\d\\s]{3,}",
            alphabet: "[A-Za-z]+",
            alphanumeric: "[A-Za-z0-9]+",
            address: '[A-Za-z0-9#/@,-." "]+'
        }
    } ] ), angular.module( "yapp" ).controller( "UpdatePasswordCtrl", [ "$scope", "$state", "Auth", function( e, a, t ) {
        e.passwordUpdate = function( n, r, i ) {
            r ? r !== i ? e.err = "Passwords do not match" : t.$changePassword( {
                email: t.$getAuth().password.email,
                oldPassword: n,
                newPassword: r
            } ).then( function() {
                a.go( "cards" )
            } )[ "catch" ]( function( a ) {
                e.err = a
            } ) : e.err = "Please enter a password"
        }
    } ] ), angular.module( "yapp" ).controller( "LandingCtrl", [ "$http", "$scope", "$state", "$stateParams", "Auth", "constants", "Ref", function( e, a, t, n, r, i, o ) {
        a.$state = t, a.hello = "Hello, world!", a.auth = r.$getAuth(), a.template = i.partials;
        var d = null,
            s = o.child( "earlyAccess" );
        a.submitEmail = function() {
            d = s.push( {
                email: a.email,
                timestamp: Firebase.ServerValue.TIMESTAMP
            }, function( e ) {
                e ? console.log( e ) : s.child( "queue" ).child( "tasks" ).push( {
                    email: a.email,
                    key: d.key()
                } )
            } ), a.savedEmail = !0
        }, a.submitCurrencies = function() {
            s.child( d.key() ).update( {
                currencies: a.currency
            } ), a.savedCurrencies = !0
        }, a.faqs = i.faqs, "kyc" === n.open ? a.faqs[ 6 ].open = !0 : a.faqs[ 6 ].open = !1, a.availableCurrencies = [ {
            name: "AUD",
            value: "AUD"
        }, {
            name: "ARS",
            value: "ARS"
        }, {
            name: "BRL",
            value: "BRL"
        }, {
            name: "CAD",
            value: "CAD"
        }, {
            name: "CHF",
            value: "CHF"
        }, {
            name: "CLP",
            value: "CLP"
        }, {
            name: "CNY",
            value: "CNY"
        }, {
            name: "DKK",
            value: "DKK"
        }, {
            name: "EUR",
            value: "EUR"
        }, {
            name: "GBP",
            value: "GBP"
        }, {
            name: "HKD",
            value: "HKD"
        }, {
            name: "INR",
            value: "INR"
        }, {
            name: "JPY",
            value: "JPY"
        }, {
            name: "KRW",
            value: "KRW"
        }, {
            name: "MXN",
            value: "MXN"
        }, {
            name: "NOK",
            value: "NOK"
        }, {
            name: "NZD",
            value: "NZD"
        }, {
            name: "SEK",
            value: "SEK"
        }, {
            name: "SGD",
            value: "SGD"
        }, {
            name: "THB",
            value: "THB"
        }, {
            name: "USD",
            value: "USD"
        } ]
    } ] ), app.factory( "Alerts", [ "Ref", function( e ) {
        var a = {};
        return a.create = function( a, t, n, r ) {
            var i = e.child( "users" ).child( r ).child( "alerts" );
            i.push( {
                type: a,
                text: t,
                closeable: n
            } )
        }, a[ "delete" ] = function( a, t ) {
            var n = e.child( "users" ).child( t ).child( "alerts" );
            n.child( a ).remove()
        }, a
    } ] ), app.factory( "DAO", [ "$firebaseArray", "$firebaseObject", "Ref", function( e, a, t ) {
        var n = {};
        return n.userData = function( e ) {
            return a( t.child( "users" ).child( e ).child( "data" ) )
        }, n.userNotificationData = function( e ) {
            return a( t.child( "users" ).child( e ).child( "data" ).child( "notifications" ) )
        }, n.updateBalanceTransactions = function( e, a ) {
            t.child( "balanceQueue" ).child( "tasks" ).push( {
                uid: a,
                cardId: e
            } )
        }, n.cardTransactions = function( a, n ) {
            return e( t.child( "users" ).child( n ).child( "cards" ).child( a ).child( "transactions" ) )
        }, n.cardInvoices = function( a, n ) {
            return e( t.child( "users" ).child( n ).child( "cards" ).child( a ).child( "invoices" ) )
        }, n.cardDetails = function( a, n ) {
            return e( t.child( "users" ).child( n ).child( "cards" ).child( a ) )
        }, n.cardDetailsObj = function( e, n ) {
            return a( t.child( "users" ).child( n ).child( "cards" ).child( e ) )
        }, n.saveCardLabel = function( e, a, n ) {
            t.child( "users" ).child( n ).child( "cards" ).child( a ).update( e )
        }, n
    } ] ), app.factory( "constants", function() {
        var e = {};
        return e.partials = {
            navbar: "views/partials/navbar.html",
            footer: "views/partials/footer.html"
        }, e.faqs = [ {
            q: "Where can I use Shake?",
            a: "Shake cards are virtual VISA cards and can be used in online transactions or at contactless terminals using Shake's Android app. The card should be presented as a VISA transaction, if a store clerk should ask."
        }, {
            q: "What currencies are supported?",
            a: "We're currently issuing USD and EUR denominated cards. You may make transactions in other currencies but, during the Alpha, these foreign transactions will be charged a 3% FX fee (we know, we hate this too). <br><br>Once Shake launches, we'll be supporting over 80 currencies. An updated list will be published here."
        }, {
            q: "What are the fees?",
            a: 'During the Alpha, we\'re charging a 1% fee on bitcoin to fiat conversion. We are using Bitpay\'s <a target="_blank" href="https://bitpay.com/bitcoin-exchange-rates#bbb"><i>Bitcoin Best Bid Rate</i></a> to calculate the rate and the exchange is done when funds are added to Shake.<br><br><b>Other fees during the Alpha:</b><br><ul><li>$0 card creation</li><li>$0 monthly fees</li><li>3% on foreign transactions</li></ul>'
        }, {
            q: "Which countries can Shake issue to?",
            a: "During the Alpha, we're issuing to more than 130 countries: Åland Islands, Albania, Andorra, Anguilla, Antigua and Barbuda, Argentina, Armenia, Aruba, Australia, Austria, Azerbaijan, Bahamas, Bahrain, Barbados, Belarus, Belgium, Belize, Bermuda, Bhutan, Bonaire, Sint Eustatius and Saba, Bosnia and Herzegovina, Brazil, Brunei Darussalam, Bulgaria, Canada, Cayman Islands, Chile, China, Cuba, Colombia, Costa Rica, Croatia, Cyprus, Czech Republic, Denmark, Dominica, Dominican Republic, Ecuador, El Salvador, Estonia, Falkland Islands, Faroe Islands, Finland, France, French Guiana, Georgia, Germany, Gibraltar, Greece, Greenland, Grenada, Guadeloupe, Guatemala, Guernsey, Guyana, Hong kong, Hungary, Iceland, Indonesia, Ireland, Isle of Man, Israel, Italy, Jamaica, Japan, Jersey, Jordan, Kazakhstan, Korea, Republic of, Kosovo, Kuwait, Latvia, Liechtenstein, Lithuania, Luxembourg, Macedonia, The Former Yugoslav Republic of, Malaysia, Maldives, Malta, Martinique, Mauritius, Mexico, Moldova, Republic of, Monaco, Mongolia, Montenegro, Morocco, Nepal, Netherlands, New Zealand, Nicaragua, Norway, Oman, Panama, Papua New Guinea, Paraguay, Peru, Philippines, Poland, Portugal, Qatar, Romania, Russian Federation, Saint Barthélemy, Saint Kitts and Nevis, Saint Lucia, Saint Martin (french part), Saint Vincent and the Grenadines, San Marino, Saudi Arabia, Serbia, Seychelles, Singapore, Sint Maarten (dutch part), Slovakia, Slovenia, Solomon Islands, South Africa, Spain, Suriname, Sweden, Switzerland, Taiwan, Thailand, Trinidad and Tobago, Turkey, Turks and Caicos Islands, Ukraine, United Arab Emirates, United Kingdom, Uruguay, and (British) Virgin Islands.<br><br>We know there is a huge demand from our friends in the US  -- we're working hard on getting Shake to you and we plan to by summer 2016."
        }, {
            q: "Tap & pay? NFC?",
            a: 'Tap & pay is a contactless method of payment used by many card companies. Some newer plastic cards have a contactless chip that allows you to tap on a terminal to process a transaction. Shake has built an Android app that emulates this card tapping interaction using your phone. <br><br>NFC (Near Field Communication) is a technology that allows your phone to emulate the interaction between a card and a terminal (among many other things). Many Android phones come with NFC, check your <a href="http://www.phonearena.com/phones" target="_blank">phone specs</a> to see if Shake tap & pay will work for you.'
        }, {
            q: "iOS? iPhone?",
            a: "Yes! An iOS app is in the works and should hit the App Store very soon. Unfortunately, Apple has kept NFC out of reach for developers so tap & pay capabilities will be unavailable on Apple devices."
        }, {
            q: "Know Your Customer (KYC) and Anti-Money Laundering (AML) policies",
            a: "Our partners require that we collect some information from our users before a card can be issued. On first sign up, we require the user to provide (without photo identification):<br><br><ul><li>First and last name</li><li>Email address</li><li>Date of birth</li><li>Address</li><li>Phone number</li></ul>If a user wants to bump up their limits, they may upgrade their account by providing photo identification and proof of address in their account settings."
        }, {
            q: "How can I top up my account?",
            a: "We accept bitcoin as a funding system. We're also looking to add more digital currencies in the short term so if you'd like to suggest something new, feel free to message us at <a href=\"mailto:contact@shakepay.co\">contact@shakepay.co</a>."
        }, {
            q: "What are my card limits?",
            a: 'On sign up, users are KYC level 1. To upgrade your limits, please send us a photo identification with a proof of address at <a href="mailto:contact@shakepay.co">contact@shakepay.co</a>.<br><br><table border="1" cellpadding="0" cellspacing="0" dir="ltr" style="table-layout:fixed;font-size:13px;font-family:arial,sans,sans-serif;border-collapse:collapse;border:1px solid #ccc"> <colgroup> <col width="171"> <col width="124"> <col width="90"> <col width="90"> <col width="90"> <col width="90"> </colgroup> <tbody> <tr style="height:21px;"> <td style="padding: 2px 3px; vertical-align: bottom;"> &nbsp; </td> <td style="padding: 2px 3px; vertical-align: bottom;"> &nbsp; </td> <td style="padding: 2px 3px; vertical-align: bottom;"> KYC level 1 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> &nbsp; </td> <td style="padding: 2px 3px; vertical-align: bottom;"> KYC level 2 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> &nbsp; </td> </tr> <tr style="height:21px;"> <td style="padding: 2px 3px; vertical-align: bottom;"> <b>Spending Limits</b> </td> <td style="padding: 2px 3px; vertical-align: bottom;"> &nbsp; </td> <td style="padding:2px 3px 2px 3px;vertical-align:bottom; "> <b>USD</b> </td> <td style="padding:2px 3px 2px 3px;vertical-align:bottom;"> <b>EUR</b> </td> <td style="padding:2px 3px 2px 3px;vertical-align:bottom; "> <b>USD</b> </td> <td style="padding:2px 3px 2px 3px;vertical-align:bottom;"> <b>EUR</b> </td> </tr> <tr style="height:21px;"> <td style="padding: 2px 3px; vertical-align: bottom;"> One-time purchase </td> <td style="padding: 2px 3px; vertical-align: bottom;"> Per purchase </td> <td style="padding: 2px 3px; vertical-align: bottom;"> $2,500 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> €2,500 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> $10,000 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> €10,000 </td> </tr> <tr style="height:21px;"> <td style="padding: 2px 3px; vertical-align: bottom;"> Value of purchases </td> <td style="padding: 2px 3px; vertical-align: bottom;"> Per day </td> <td style="padding: 2px 3px; vertical-align: bottom;"> $2,500 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> €2,500 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> $20,000 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> €20,000 </td> </tr> <tr style="height:21px;"> <td style="padding: 2px 3px; vertical-align: bottom;"> Value of lifetime purchases </td> <td style="padding: 2px 3px; vertical-align: bottom;"> Lifetime </td> <td style="padding: 2px 3px; vertical-align: bottom;"> $2,500 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> €2,500 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> no limit </td> <td style="padding: 2px 3px; vertical-align: bottom;"> no limit </td> </tr> <tr style="height:21px;"> <td style="padding: 2px 3px; vertical-align: bottom;"> Number of card loads </td> <td style="padding: 2px 3px; vertical-align: bottom;"> Per day </td> <td style="padding: 2px 3px; vertical-align: bottom;"> 2 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> 2 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> 5 </td> <td style="padding: 2px 3px; vertical-align: bottom;"> 5 </td> </tr> </tbody> </table>'
        }, {
            q: "How do I use the Shake Android app?",
            a: "Here are a few quick tips:<br><br><ul><li>Make sure the tap & pay symbol in the top right is white. This means your phone is ready to tap & pay at a terminal.</li><li>Your phone must be unlocked and the Shake app must be open for every transaction.</li></ul>"
        }, {
            q: "What happens if my phone gets stolen?",
            a: 'Shake does not transmit any details if your phone is locked therefore we strongly recommend having a password or security pattern for your phone. If you are worried about your card being used, <a href="mailto:contact@shakepay.co">contact us</a> and we\'ll block your card.'
        }, {
            q: "How does Shake make money?",
            a: "We have two revenue streams: The 1% bitcoin to fiat conversion and the spread on the interchange fee paid by the merchant when a card is used.<br><br>We're exploring ways to remove the 1% bitcoin to fiat conversion because we agree that it sucks to be charged for spending your money."
        }, {
            q: "Bitcoin? What is it and how do I get started?",
            a: 'Check out <a href="https://bitcoin.org/en/how-it-works" target="_blank">Bitcoin.org\'s how it works</a>.'
        }, {
            q: "Is bitcoin safe?",
            a: 'Yes, bitcoin transactions can be safer than credit card transactions when certain precautions are taken. Every user should understand how to keep their wallets safe; <a href="https://bitcoin.org/en/secure-your-wallet" target="_blank">here</a>\'s a good starting point.'
        } ], e.currencies = function() {
            var e = [ {
                name: "US Dollar (USD)",
                value: "USD"
            }, {
                name: "Euro (EUR)",
                value: "EUR"
            } ];
            return e
        }, e.commission = function() {
            return .01
        }, e.cardLimits = function( e ) {
            switch ( e ) {
                case "EUR":
                    return 25e4;
                case "USD":
                    return 25e4;
                case "GBP":
                    return 2e5
            }
        }, e.countries = function() {
            var e = [ {
                name: "Åland Islands",
                code: "AX"
            }, {
                name: "Albania",
                code: "AL"
            }, {
                name: "Andorra",
                code: "AD"
            }, {
                name: "Anguilla",
                code: "AI"
            }, {
                name: "Antigua and Barbuda",
                code: "AG"
            }, {
                name: "Argentina",
                code: "AR"
            }, {
                name: "Armenia",
                code: "AM"
            }, {
                name: "Aruba",
                code: "AW"
            }, {
                name: "Australia",
                code: "AU"
            }, {
                name: "Austria",
                code: "AT"
            }, {
                name: "Azerbaijan",
                code: "AZ"
            }, {
                name: "Bahamas",
                code: "BS"
            }, {
                name: "Bahrain",
                code: "BH"
            }, {
                name: "Barbados",
                code: "BB"
            }, {
                name: "Belarus",
                code: "BY"
            }, {
                name: "Belgium",
                code: "BE"
            }, {
                name: "Belize",
                code: "BZ"
            }, {
                name: "Bermuda",
                code: "BM"
            }, {
                name: "Bhutan",
                code: "BT"
            }, {
                name: "Bonaire, Sint Eustatius and Saba",
                code: "BQ"
            }, {
                name: "Bosnia and Herzegovina",
                code: "BA"
            }, {
                name: "Brazil",
                code: "BR"
            }, {
                name: "Brunei Darussalam",
                code: "BN"
            }, {
                name: "Bulgaria",
                code: "BG"
            }, {
                name: "Canada",
                code: "CA"
            }, {
                name: "Cayman Islands",
                code: "KY"
            }, {
                name: "Chile",
                code: "CL"
            }, {
                name: "China",
                code: "CN"
            }, {
                name: "Colombia",
                code: "CO"
            }, {
                name: "Costa Rica",
                code: "CR"
            }, {
                name: "Croatia",
                code: "HR"
            }, {
                name: "Cyprus",
                code: "CY"
            }, {
                name: "Czech Republic",
                code: "CZ"
            }, {
                name: "Denmark",
                code: "DK"
            }, {
                name: "Dominica",
                code: "DM"
            }, {
                name: "Dominican Republic",
                code: "DO"
            }, {
                name: "Ecuador",
                code: "EC"
            }, {
                name: "El Salvador",
                code: "SV"
            }, {
                name: "Estonia",
                code: "EE"
            }, {
                name: "Falkland Islands (Malvinas)",
                code: "FK"
            }, {
                name: "Faroe Islands",
                code: "FO"
            }, {
                name: "Finland",
                code: "FI"
            }, {
                name: "France",
                code: "FR"
            }, {
                name: "French Guiana",
                code: "GF"
            }, {
                name: "Georgia",
                code: "GE"
            }, {
                name: "Germany",
                code: "DE"
            }, {
                name: "Gibraltar",
                code: "GI"
            }, {
                name: "Greece",
                code: "GR"
            }, {
                name: "Greenland",
                code: "GL"
            }, {
                name: "Grenada",
                code: "GD"
            }, {
                name: "Guadeloupe",
                code: "GP"
            }, {
                name: "Guatemala",
                code: "GT"
            }, {
                name: "Guyana",
                code: "GY"
            }, {
                name: "Hong Kong",
                code: "HK"
            }, {
                name: "Hungary",
                code: "HU"
            }, {
                name: "Iceland",
                code: "IS"
            }, {
                name: "Indonesia",
                code: "ID"
            }, {
                name: "Ireland",
                code: "IE"
            }, {
                name: "Isle of Man",
                code: "IM"
            }, {
                name: "Israel",
                code: "IL"
            }, {
                name: "Italy",
                code: "IT"
            }, {
                name: "Jamaica",
                code: "JM"
            }, {
                name: "Japan",
                code: "JP"
            }, {
                name: "Jersey",
                code: "JE"
            }, {
                name: "Jordan",
                code: "JO"
            }, {
                name: "Kazakhstan",
                code: "KZ"
            }, {
                name: "Korea, Republic of",
                code: "KR"
            }, {
                name: "Kosovo",
                code: "QZ"
            }, {
                name: "Kuwait",
                code: "KW"
            }, {
                name: "Latvia",
                code: "LV"
            }, {
                name: "Liechtenstein",
                code: "LI"
            }, {
                name: "Lithuania",
                code: "LT"
            }, {
                name: "Luxembourg",
                code: "LU"
            }, {
                name: "Macedonia, The Former Yugoslav Republic of",
                code: "MK"
            }, {
                name: "Malaysia",
                code: "MY"
            }, {
                name: "Maldives",
                code: "MV"
            }, {
                name: "Malta",
                code: "MT"
            }, {
                name: "Martinique",
                code: "MQ"
            }, {
                name: "Mauritius",
                code: "MU"
            }, {
                name: "Mexico",
                code: "MX"
            }, {
                name: "Moldova, Republic of",
                code: "MD"
            }, {
                name: "Monaco",
                code: "MC"
            }, {
                name: "Mongolia",
                code: "MN"
            }, {
                name: "Montenegro",
                code: "ME"
            }, {
                name: "Morocco",
                code: "MA"
            }, {
                name: "Nepal",
                code: "NP"
            }, {
                name: "Netherlands",
                code: "NL"
            }, {
                name: "New Zealand",
                code: "NZ"
            }, {
                name: "Nicaragua",
                code: "NI"
            }, {
                name: "Norway",
                code: "NO"
            }, {
                name: "Oman",
                code: "OM"
            }, {
                name: "Panama",
                code: "PA"
            }, {
                name: "Papua New Guinea",
                code: "PG"
            }, {
                name: "Paraguay",
                code: "PY"
            }, {
                name: "Peru",
                code: "PE"
            }, {
                name: "Philippines",
                code: "PH"
            }, {
                name: "Poland",
                code: "PL"
            }, {
                name: "Portugal",
                code: "PT"
            }, {
                name: "Qatar",
                code: "QA"
            }, {
                name: "Romania",
                code: "RO"
            }, {
                name: "Russian Federation",
                code: "RU"
            }, {
                name: "Saint Barthélemy",
                code: "BL"
            }, {
                name: "Saint Kitts and Nevis",
                code: "KN"
            }, {
                name: "Saint Lucia",
                code: "LC"
            }, {
                name: "Saint Martin",
                code: "MF"
            }, {
                name: "Saint Vincent and the Grenadines",
                code: "VC"
            }, {
                name: "San Marino",
                code: "SM"
            }, {
                name: "Saudi Arabia",
                code: "SA"
            }, {
                name: "Serbia",
                code: "RS"
            }, {
                name: "Seychelles",
                code: "SC"
            }, {
                name: "Singapore",
                code: "SG"
            }, {
                name: "Sint Maarten",
                code: "SX"
            }, {
                name: "Slovakia",
                code: "SK"
            }, {
                name: "Slovenia",
                code: "SI"
            }, {
                name: "Solomon Islands",
                code: "SB"
            }, {
                name: "South Africa",
                code: "ZA"
            }, {
                name: "Spain",
                code: "ES"
            }, {
                name: "Suriname",
                code: "SR"
            }, {
                name: "Sweden",
                code: "SE"
            }, {
                name: "Switzerland",
                code: "CH"
            }, {
                name: "Taiwan, Province of China",
                code: "TW"
            }, {
                name: "Thailand",
                code: "TH"
            }, {
                name: "Trinidad and Tobago",
                code: "TT"
            }, {
                name: "Turkey",
                code: "TR"
            }, {
                name: "Turks and Caicos Islands",
                code: "TC"
            }, {
                name: "Ukraine",
                code: "UA"
            }, {
                name: "United Arab Emirates",
                code: "AE"
            }, {
                name: "United Kingdom",
                code: "GB"
            }, {
                name: "Uruguay",
                code: "UY"
            }, {
                name: "Virgin Islands, British",
                code: "VG"
            } ];
            return e
        }, e
    } ), app.factory( "util", function() {
        var e = {};
        return e.formatAmount = function( e ) {
            function a( e ) {
                for ( var a = String( e ).split( "" ), t = -3; a.length + t > 0; ) a.splice( t, 0, "," ), t -= 4;
                return a.join( "" )
            }

            function t( e ) {
                return e && 1 === e.length ? 10 * e : e && e % 10 > 0 ? e : "00"
            }
            if ( e ) {
                var n = String( e / 100 ).split( /[.,]/ );
                return a( n[ 0 ] ) + "." + t( n[ 1 ] )
            }
            return "0.00"
        }, e.dollarsToCents = function( e ) {
            function a( e ) {
                return 100 * e
            }
            if ( "string" == typeof e ) return a( parseInt( e, 10 ) ).toString();
            if ( "number" == typeof e ) return a( e );
            throw new Error( "Invalid type" )
        }, e.centsToDollars = function( e ) {
            function a( e ) {
                return e / 100
            }
            if ( "string" == typeof e ) return a( parseFloat( e ) ).toString();
            if ( "number" == typeof e ) return a( e );
            throw new Error( "Invalid type" )
        }, e.addCommission = function( e, a ) {
            return Math.round( ( 1 + e ) * a )
        }, e.subtractCommission = function( e, a ) {
            return Math.round( a / ( 1 + e ) )
        }, e.twoDecimals = function( e ) {
            return parseFloat( Math.round( 100 * e ) / 100 ).toFixed( 2 )
        }, e
    } ),
    function() {
        angular.module( "firebase.auth", [ "firebase", "firebase.ref" ] ).factory( "Auth", [ "$firebaseAuth", "Ref", function( e, a ) {
            return e( a )
        } ] ).factory( "AuthData", [ "Auth", function( e ) {
            return e.$getAuth()
        } ] )
    }(), angular.module( "firebase.config", [] ).constant( "SIMPLE_LOGIN_PROVIDERS", [ "password" ] ).constant( "loginRedirectPath", "/" ), angular.module( "firebase.ref", [ "firebase", "firebase.config" ] ).factory( "Ref", [ "$window", "FBURL", function( e, a ) {
        return new e.Firebase( a )
    } ] );

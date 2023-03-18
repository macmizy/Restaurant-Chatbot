const http = require('http')
const express = require("express")
const session = require("express-session")
require("dotenv").config()
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server)

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        //set expiry time for session to 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
})

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
})

const Foods = {
    100: {
      name: 'Refuel Meal',
      price: 600,
    },
    101: {
      name: 'Refuel Max',
      price: 1000,
    },
    102: {
      name: 'Refuel Dodo',
      price: 900,
    },
    103: {
      name: 'Refuel Dodo Max',
      price: 1000,
    },
    104: {
      name: 'Pot Lovers Meal',
      price: 6100,
    },
    105: {
      name: 'Soulfully spiced fried chicken',
      price: 500,
    },
    106: {
      name: 'Citizens Meal',
      price: 1550,
    },
    107: {
      name: 'Express Meal',
      price: 1000,
    },
    109: {
      name: 'Quarter Rotisserie Meal',
      price: 1600,
    },
    110: {
      name: 'Quarter Rotisserie Meal with Chips',
      price: 1900,
    },
    111: {
      name: 'Full Rotisserie Chicken',
      price: 4000,
    },
    112: {
      name: 'Half Rotisserie Chicken',
      price: 2200,
    },
    113: {
        name: 'New big crew meal',
        price: 6300,
      },
    114: {
        name: 'Quarter Rotisserie Chicken',
        price: 1100,
      },
    115:{
        name: 'Big Boyz Meal',
        price: 2300,
    },
    116:{
        name: 'Double ChickWizz Meal',
        price: 1900 ,
    },
    117:{
        name: 'Chief Burger Meal',
        price: 1900,
    },
    118:{
        name: 'ChickWizz',
        price: 900,
    },
    119:{
        name: 'Double ChickWizz',
        price: 1100,
    },
    120:{
        name: 'Chief Burger',
        price: 1100,
    },
    121:{
        name: 'Fried rice',
        price: 450,
    },
    122:{
        name: 'Spicy rice',
        price: 500,
    },
    123:{
        name: 'Pepper sauce',
        price: 150,
    },
    124:{
        name: 'Chicken salad',
        price: 900,
    },
    125:{
        name: 'Spaghetti',
        price: 450,
    },
    126:{
        name: 'Moi-moi',
        price: 300,
    },
    127:{
        name: 'Sprite (60CL)',
        price: 300,
    },
    128:{
        name: 'Fanta orange (60CL)',
        price: 300,
    },
    129:{
        name: 'Coca Cola (60CL)',
        price: 300,
    },
    130:{
        name: 'Monster Energy (Regular)',
        price: 600,
    },
};

const orderHistory = [];

// Define the menu string return name and price as name@#price
const getMenuString = () => {
    let menuString = '';
    for (const key in Foods) {
      menuString += `${key}. ${Foods[key].name} @ ₦${Foods[key].price}\n`;
    }
    return menuString;
  };
  
  

io.on("connection", socket => {
   
    //bot message function
    const sendBotMessage = (message) => {
        // console.log('Bot message received:', message);
        socket.emit('bot-message', message);
    };

    // Define the current order
    socket.request.session.currentOrder = [];

    // Define the state
    const initialState = {
        selectedMenuItem: null,
        waitingForQuantity: false,
        checkoutConfirmation: false,
    };

    let state = { ...initialState };

    const handleUserInput = (message) => {
        if (state.waitingForQuantity) {
          const quantity = parseInt(message);
          if (isNaN(quantity)) {
            sendBotMessage('Invalid quantity. Please enter a number.');
            return;
          }
          const selectedItem = state.selectedMenuItem;
          const orderItem = {
            name: selectedItem.name,
            quantity: quantity,
            price: selectedItem.price * quantity,
          };
          socket.request.session.currentOrder.push(orderItem);
          sendBotMessage(
            `${quantity}. ${selectedItem.name}@₦${selectedItem.price} =  ₦${
              selectedItem.price * quantity
            } has been added to your cart. Do you want to add more items to your cart?\n 1. See menu.\n99. to checkout. \n00. Main menu`
          );
          // Reset the state
          state = { ...initialState };
        } else if (state.checkoutConfirmation) {
          if (message === '1') {
            // Add the current order to the order history
            orderHistory.push(socket.request.session.currentOrder);
            // Send the order summary
            sendBotMessage(
              'Your order has been placed. Thank you for shopping with us.\n00. Return to Main Menu'
            );
          } else {
            sendBotMessage(
              'Your order has been cancelled. Thank you for shopping with us.\n00. Return to Main Menu'
            );
          }
          // Reset the state
          state = { ...initialState };
          // Reset the current order
          socket.request.session.currentOrder = [];
        } else {
          switch (message) {
            case '1':
              sendBotMessage(
                `Here is a list of items you can order:\n${getMenuString()}\n Please select one\n00 Return to main menu.`
              );
              break;
            case '100':
            case '101':
            case '102':
            case '103':
            case '104':
            case '105':
            case '106':
            case '107':
            case '108':
            case '109':
            case '110':
            case '111':
            case '112':
            case '113':
            case '114':
            case '115':
            case '116':
            case '117':
            case '118':
            case '119':
            case '120':
            case '121':
            case '122':
            case '123':
            case '124':
            case '125':
            case '126':
            case '127':
            case '128':
            case '129':
            case '130':
              handleItemSelection(parseInt(message));
              break;
            case '99':
              handleCheckout();
              break;
            case '98':
              handleOrderHistory();
              break;
            case '97':
              handleCurrentOrder();
              break;
            case '0':
              handleOrderCancellation();
              break;
            case '00':
              handleMainMenu();
              break;
            default:
              sendBotMessage('Invalid selection. Please try again.');
              break;
          }
        }
      };

    
      const handleCheckout = () => {
        if (socket.request.session.currentOrder.length === 0) {
          sendBotMessage('No order to place. Place an order\n1. See menu');
        } else {
          const totalPrice = socket.request.session.currentOrder.reduce(
            (acc, item) => acc + item.price,
            0
          );
          const orderItems = socket.request.session.currentOrder
            .map((item) => `${item.name} x ${item.quantity} = ₦${item.price}\n`)
            .join(', ');
          sendBotMessage(
            `Order placed \n` +
              `Your order is ${orderItems}\nTotal: ${totalPrice}\n\n` +
              `1. Confirm order\n0. Cancel Order`
          );
    
          // Set the state to keep track of the checkout confirmation
          state.checkoutConfirmation = true;
        }
      };
    
      const handleOrderHistory = () => {
        if (orderHistory.length === 0) {
          sendBotMessage('No previous orders');
        } else {
          const orderHistoryString = orderHistory
            .map((order, index) => {
              const totalPrice = order.reduce((acc, item) => acc + item.price, 0);
              return `Order ${index + 1}: ${order.map(
                (item) => `${item.name} x ${item.quantity} = ₦${item.price}.\n`
              )}\nTotal: ${totalPrice}\n`;
            })
            .join('\n');
          sendBotMessage(
            `Here is your order history:\n${orderHistoryString}\n\n00 Return to main menu`
          );
        }
      };
    
      const handleCurrentOrder = () => {
        if (socket.request.session.currentOrder.length === 0) {
          sendBotMessage('No current order. Place an order\n1. See menu');
        } else {
          const totalPrice = socket.request.session.currentOrder.reduce(
            (acc, item) => acc + item.price,
            0
          );
          const orderItems = socket.request.session.currentOrder.map(
            (item) => `${item.name} x ${item.quantity} = ₦${item.price}.\n`
          );
    
          sendBotMessage(`Here is your current order:
          
          ${orderItems}\nTotal: ${totalPrice}\n\nDo you want to place this order?\n99. Checkout\n0. Cancel Order\n00. Return to main menu`);
        }
      };
    
      const handleOrderCancellation = () => {
        socket.request.session.currentOrder = [];
        sendBotMessage(
          'Order cancelled. Place a new order\n1. See menu\n00 Return to main menu'
        );
      };
    
      const handleMainMenu = () => {
        sendBotMessage(
          `Welcome to the Don Restaurant, \n1. Place an Order\n99. Checkout\n98. Order History\n97. Current Order\n0. Cancel Order`
        );
      };

    const handleItemSelection = (selectedIndex) => {
        if (Foods.hasOwnProperty(selectedIndex)) {
          const selectedItem = Foods[selectedIndex];
          sendBotMessage(`How many ${selectedItem.name} do you want to order?`);
          // Set the state to keep track of the selected item and wait for the quantity
          state.selectedMenuItem = selectedItem;
          state.waitingForQuantity = true;
        } else {
          sendBotMessage('Invalid selection.');
        }
      };


    
    
    sendBotMessage("Welcome to the Don Restaurant, Place an order \n1. place an Order\n99. Checkout order\n98. Order History\n97. Current Order\n0. Cancel order")
    socket.on('user-message', (message) => {
      
        handleUserInput(message);
    
    });

})




app.set("view engine", "ejs")
app.set('views','views')
app.use("/static", express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({extended: true}))
app.get("/", (req,res)=>{
    try{
        res.render("index.ejs")
    }catch(error){
        res.status(500).send("Error rendering index")
    }
})

const PORT = process.env.PORT

server.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})
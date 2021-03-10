const e = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("Users");
const Trail = mongoose.model("Trails");

function degreeToRadian(degree) {
    return degree * Math.PI / 180;
}

function calculateClosestTrail(lat1, long1, lat2, long2) {
    const lat1R = degreeToRadian(lat1);
    const lat2R = degreeToRadian(lat2);
    const deltaLat = degreeToRadian(lat2 - lat1);
    const deltaLong = degreeToRadian(long2 - long1);

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + Math.cos(lat1R) * Math.cos(lat2R) * Math.sin(deltaLong/2) * Math.sin(deltaLong/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return 6371000.0 * c  // 6371000 is Earth radius;  result is returned in meters
}


function calculateBmi(weight, height) {
    if (weight != null && height != null) {
        const bmi = (parseFloat(weight) / (parseFloat(height) ** 2)) * 703.0
        // console.log(bmi);
        let bmi_result;
        if (bmi < 18.5) {
            bmi_result = "Underweight";
        } else if (bmi < 25) {
            bmi_result = "Normal weight";
        } else if (bmi < 30) {
            bmi_result = "Overweight";
        } else {
            bmi_result = "Obesity";
        }
        return bmi_result;
    }
    return "Error: Please enter a weight and height";
}

function calculateRec(trails, num_of_results, latitude, longitude) {
    let closest_distance = 9999999;
    let trail_dict = {};
    let trail_distances = [];
    let trail_scores = [];
    let top_trails = [];

    trails.forEach(trail => {
        // Calculate the distance between each trail and user's current location
        let current_distance = calculateClosestTrail(trail.latitude, trail.longitude, latitude, longitude);
        trail_distances.push(current_distance);
        // trail_scores.push((parseFloat(trail.rating.split(" ")[0])/5.0) * 0.3); 
        trail_dict[trail.name] = (parseFloat(trail.rating.split(" ")[0])/5.0) * 0.3; // Give each trail a score based on its rating
        if (current_distance < closest_distance) {
            closest_distance = current_distance;
        }
        console.log(calculateClosestTrail(trail.latitude, trail.longitude, latitude, longitude), trail.name, trail.rating, (parseFloat(trail.rating.split(" ")[0])/5.0), trail.difficulty);
    })

    let index = 0;
    Object.keys(trail_dict).forEach(function(key) {
        trail_dict[key] += 1/(trail_distances[index++] / closest_distance) * 0.5;
    })

    // convert dict to array
    trail_scores = Object.keys(trail_dict).map(function(key) {
        return [key, trail_dict[key]];
    })

    // sort
    trail_scores.sort(function(item1, item2) {
        return item2[1] - item1[1];
    })

    console.log(trail_distances);
    console.log(trail_scores.slice(0,num_of_results));
    // console.log(trails[trail_scores.indexOf(Math.max(...trail_scores))]);
    // console.log(trail_dict);
    for (let index = 0; index < num_of_results; index++) {
        top_trails.push(trail_scores[index][0]);
        
    }

    return JSON.stringify(top_trails);
    // return trail_scores.slice(0,5);
    // return trails[trail_scores.indexOf(Math.max(...trail_scores))].name;
}

module.exports = (app) => {
    app.post("/api/get_recommendation", async (req, res) => {
        const { email, latitude, longitude } = req.body;
        // console.log(email);
        const user = await User.findOne({email: email});
        user.latitude = latitude;
        user.longitude = longitude; //Data about user is stored here
        // console.log(user.latitude);
        // console.log(user.longitude);
        if (user){
            current_user_bmi = calculateBmi(user.weight, user.height);
            if (current_user_bmi.localeCompare("Obesity") == 0 || current_user_bmi.localeCompare("Underweight") == 0) {
                const trails = await Trail.find({difficulty: "easy"});
                // console.log(trails);
                // console.log(trails.length);
                // console.log(calculateRec(trails));
                res.send(calculateRec(trails, 5, user.latitude, user.longitude))
            } else {
                const trails = await Trail.find({});
                // console.log(trails);
                // console.log(trails.length);
                res.send(calculateRec(trails, 5, user.latitude, user.longitude))
            }
            await user.save();
            console.log(current_user_bmi);
            console.log(user.name);

        }
        else {
            res.send("Error: Can't find user");
        }
        
        // const users = await User.find({}, function(err, elements) {
        //     elements.forEach(user => {
        //         console.log(calculateBmi(user.weight, user.height));
        //         // calculateRecommendation();
        //     });
        // });
        // console.log(users);

        // console.log(trails);
        
        // res.send(calculateBmi(users[0].weight, users[0].height));
        // calculateRecommendation();
        // res.write(users);
        // res.send(users);
    })
};
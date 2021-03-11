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

function difficultyMultiplier(difficulty) {
    if (difficulty.localeCompare("moderate") == 0) {
        // We want to suggest the "normal" difficulty slightly more often
        return 0.35 * 0.2;
    } else if (difficulty.localeCompare("hard") == 0) {
        return 1/3 * 0.2;
    } else {
        // easy difficulty
        return 0.32 * 0.2;
    }
}

function calculateRec(current_user, trails, num_of_results, latitude, longitude) {
    let closest_distance = 9999999;
    let trail_dict = {};
    let trail_distances = [];
    let trail_scores = [];

    trails.forEach(trail => {
        // Calculate the distance between each trail and user's current location
        let current_distance = calculateClosestTrail(trail.latitude, trail.longitude, latitude, longitude);
        if (current_distance <= 80467.2) { // limit to 50 mile radius or ~ 1 hour drive
            trail_distances.push(current_distance);
            trail_dict[trail.name] = {"score": ((parseFloat(trail.rating.split(" ")[0])/5.0) * 0.3) + (difficultyMultiplier(trail.difficulty)), 
                                        "latitude": trail.latitude, "longitude": trail.longitude, "difficulty": trail.difficulty}; // Give each trail a score based on its rating
            if (current_distance < closest_distance) {
                closest_distance = current_distance;
            }
            console.log(calculateClosestTrail(trail.latitude, trail.longitude, latitude, longitude), trail.name, trail.rating, 
                    ((parseFloat(trail.rating.split(" ")[0])/5.0) * 0.3) + (difficultyMultiplier(trail.difficulty)), trail.difficulty);
        }
    })

    let index = 0;
    Object.keys(trail_dict).forEach(function(key) {
        trail_dict[key].score += 1/(trail_distances[index++] / closest_distance) * 0.5;
        trail_dict[key].score -= current_user.trails_visited.get(key) * .02;
        console.log(key, " + ", trail_dict[key].score);
        // console.log("Start here ", key, trail_dict[key].score);
    })

    // convert dict to array
    trail_scores = Object.keys(trail_dict).map(function(key) {
        return [key, trail_dict[key]];
    })

    // sort
    trail_scores.sort(function(item1, item2) {
        return item2[1].score - item1[1].score;
    })

    // console.log(trail_distances);
    // console.log(trail_scores.slice(0,num_of_results));

    return trail_scores.slice(0, num_of_results);
}

function initTrailTracker(user, trails) {
    let difficulty = ["easy", "moderate", "hard"];
    for (let index = 0; index < difficulty.length; index++) {
        let value = user.trails_visited.get(difficulty[index]);
        if (isNaN(value)) {
            user.trails_visited.set(difficulty[index], 0);
        }
    }

    trails.forEach(trail => {
        let value = user.trails_visited.get(trail.name);
        if (isNaN(value)) {
            user.trails_visited.set(trail.name, 0);
        }
    })
}

function updateTrailTracker(user, trails) {
    trails.forEach(trail => {
        // console.log(trail[0],"&", trail[1].difficulty);
        let value = user.trails_visited.get(trail[0]);
        user.trails_visited.set(trail[0], ++value);

        value = user.trails_visited.get(trail[1].difficulty);
        user.trails_visited.set(trail[1].difficulty, ++value);
        
    })
}

module.exports = (app) => {
    app.post("/api/get_recommendation", async (req, res) => { 
        const { email, latitude, longitude } = req.body;
        const user = await User.findOne({email: email}); 
        if (user){
            // test location: 37.4220656 -122.0840897   TEMPORARY
            user.latitude = latitude;        
            user.longitude = longitude; //Data about user is stored here    
            current_user_bmi = calculateBmi(user.weight, user.height);
            if (current_user_bmi.localeCompare("Obesity") == 0 || current_user_bmi.localeCompare("Underweight") == 0) {
                const trails = await Trail.find({difficulty: "easy"});
                initTrailTracker(user, trails);
                const result = calculateRec(user, trails, 5, user.latitude, user.longitude);
                updateTrailTracker(user, result);
                // console.log(result);
                res.send(result);
            } else {
                const trails = await Trail.find({});
                initTrailTracker(user, trails);
                const result = calculateRec(user, trails, 5, user.latitude, user.longitude); 
                updateTrailTracker(user, result);
                // console.log(result);
                res.send(result);
            }
            // console.log(user.trails_visited);
            await user.save();
            console.log(user.trails_visited);
            console.log(current_user_bmi);
            console.log(user.name);
        }
        else {
            res.send("Error: Can't find user");
        }
    })
};
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";


// Specify the data migration module in the with-clause

actor {
  /*** DietPlan Types ***/

  type Gender = {
    #male;
    #female;
  };

  type HealthGoal = {
    #weight_loss;
    #muscle_gain;
    #maintenance;
    #body_recomposition;
  };

  type ActivityLevel = {
    #sedentary;
    #lightly_active;
    #moderately_active;
    #very_active;
    #extra_active;
  };

  type StressLevel = {
    #low;
    #moderate;
    #high;
    #very_high;
  };

  type DietProfile = {
    id : Text;
    name : Text;
    age : Nat;
    gender : Gender;
    height : Float;
    weight : Float;
    goal : HealthGoal;
    activity_level : ActivityLevel;
    dietary_preferences : [Text];
    food_allergies : [Text];
    meals_per_day : Nat;
    water_intake : Float;
    health_conditions : [Text];
    sleep_hours : Float;
    stress_level : StressLevel;
    supplements : [Text];
  };

  type MacronutrientBreakdown = {
    protein : Float;
    carbs : Float;
    fats : Float;
  };

  type Meal = {
    name : Text;
    calories : Float;
    protein : Float;
    carbs : Float;
    fats : Float;
    ingredients : [Text];
  };

  type DayPlan = {
    breakfast : Meal;
    lunch : Meal;
    dinner : Meal;
    snacks : [Meal];
  };

  type DietPlan = {
    profile_id : Text;
    bmr : Float;
    tdee : Float;
    daily_calories : Float;
    macros : MacronutrientBreakdown;
    weekly_plan : [DayPlan];
    hydration_recommendation : Float;
    health_tips : [Text];
  };

  /*** Admin Report Types ***/

  type AdminReport = {
    id : Text;
    name : Text;
    whatsapp : Text;
    referredBy : Text;
    goal : Text;
    amount : Float;
    paidAt : Text;
    rewardPaid : Bool;
  };

  module DietProfile {
    public func compare(profile1 : DietProfile, profile2 : DietProfile) : Order.Order {
      Text.compare(profile1.id, profile2.id);
    };
  };

  module DietPlan {
    public func compare(plan1 : DietPlan, plan2 : DietPlan) : Order.Order {
      Text.compare(plan1.profile_id, plan2.profile_id);
    };
  };

  /*** State: Use persistent Maps for storage ***/

  let profiles = Map.empty<Text, DietProfile>();
  let plans = Map.empty<Text, DietPlan>();
  let adminReports = Map.empty<Text, AdminReport>();

  /*** DietPlan Methods ***/

  public shared ({ caller }) func addProfile(profile : DietProfile) : async () {
    switch (profiles.get(profile.id)) {
      case (null) {
        profiles.add(profile.id, profile);
      };
      case (?_) {
        Runtime.trap("Profile already exists");
      };
    };
  };

  public query ({ caller }) func getProfile(id : Text) : async DietProfile {
    switch (profiles.get(id)) {
      case (null) {
        Runtime.trap("Profile does not exist");
      };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getAllProfiles() : async [DietProfile] {
    profiles.values().toArray().sort();
  };

  public shared ({ caller }) func addDietPlan(plan : DietPlan) : async () {
    switch (plans.get(plan.profile_id)) {
      case (null) { plans.add(plan.profile_id, plan) };
      case (?_) { Runtime.trap("Diet plan already exists for this profile") };
    };
  };

  public query ({ caller }) func getDietPlan(profile_id : Text) : async DietPlan {
    switch (plans.get(profile_id)) {
      case (null) { Runtime.trap("Diet plan does not exist for this profile") };
      case (?plan) { plan };
    };
  };

  public query ({ caller }) func getAllDietPlans() : async [DietPlan] {
    plans.values().toArray().sort();
  };

  public query ({ caller }) func deleteWrapper(_ : Text) : async Text {
    Runtime.trap("You cannot delete the entire diet plan generator backend canister.");
  };

  /*** Admin Report Methods ***/

  /// Add admin report. Public, no authentication performed!
  public shared ({ caller }) func addAdminReport(report : AdminReport) : async () {
    switch (adminReports.get(report.id)) {
      case (null) {
        adminReports.add(report.id, report);
      };
      case (?_) {
        Runtime.trap("Report already exists");
      };
    };
  };

  /// Get all admin reports. Public, no authentication performed!
  public query ({ caller }) func getAdminReports() : async [AdminReport] {
    adminReports.values().toArray();
  };

  /// Set rewardPaid flag to true. Public, no authentication performed!
  public shared ({ caller }) func markRewardPaid(id : Text) : async Bool {
    let report = switch (adminReports.get(id)) {
      case (null) { Runtime.trap("Report does not exist") };
      case (?report) { report };
    };
    let updatedReport = { report with rewardPaid = true };
    adminReports.add(id, updatedReport);
    true;
  };
};

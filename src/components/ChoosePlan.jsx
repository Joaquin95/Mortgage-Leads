import React from "react";

const ChoosePlan = ({ user }) => {
  return (
    <div className="choose-plan">
      <h3>Choose a Plan</h3>
      <p>Select a plan to start receiving Texas mortgage leads.</p>

      <a href="https://checkout.stripe.com/pay/YOUR_PLAN_5_LEADS"className="btn starter">Starter (5 Leads)</a>
      <a href="https://checkout.stripe.com/pay/YOUR_PLAN_10_LEADS"className="btn pro">Pro (10 Leads)</a>
      <a href="https://checkout.stripe.com/pay/YOUR_PLAN_20_LEADS"className="btn elite">Elite (20 Leads)</a>
    </div>
  );
};

export default ChoosePlan;
// Note: Replace the href links with your actual Stripe checkout links for each plan.
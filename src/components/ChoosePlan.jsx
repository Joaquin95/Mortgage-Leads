import React from "react";

const ChoosePlan = ({ user }) => {
  return (
    <div className="choose-plan">
      <h3>Choose a Plan</h3>
      <p>Select a plan to start receiving Texas mortgage leads.</p>

      <a href="https://buy.stripe.com/test_Starter" className="btn starter">Starter (5 Leads)</a>
      <a href="https://buy.stripe.com/test_Pro" className="btn pro">Pro (10 Leads)</a>
      <a href="https://buy.stripe.com/test_Elite" className="btn elite">Elite (20 Leads)</a>
    </div>
  );
};

export default ChoosePlan;
// Note: Replace the href links with your actual Stripe checkout links for each plan.
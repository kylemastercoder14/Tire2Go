import React from "react";
import StatsCard from "./_components/stats-card";
import { SoldChart } from './_components/orders-chart';
import { BrandChart } from './_components/brand-chart';
import { ProductChart } from './_components/product-chart';

const Page = () => {
  return (
    <div>
      <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
        <StatsCard
          title="Total Revenue"
          data="₱56,274.75"
          percentage="+12.4%"
          trend="up"
          description="Compared to last month"
          recommendation="Keep up the good work!"
        />
		<StatsCard
          title="New Customers"
          data="278"
          percentage="-0.4%"
          trend="down"
          description="Down 0.4% this period"
          recommendation="Focus on customer retention."
        />
		<StatsCard
          title="Tires Sold"
          data="572"
          percentage="+4.4%"
          trend="up"
          description="Strong tire sales this month"
          recommendation="Consider promotional offers."
        />
		<StatsCard
          title="Inventory Turnover"
          data="8.5%"
          percentage="+8.6%"
          trend="up"
          description="Inventory turnover improved"
          recommendation="Optimize stock levels."
        />
      </div>
	  <div className="mt-5">
		<SoldChart />
	  </div>
	  <div className="mt-5 grid lg:grid-cols-2 grid-cols-1 gap-5">
		<BrandChart />
		<ProductChart />
	  </div>
    </div>
  );
};

export default Page;





db.increments.findOneAndUpdate(
     { table_slug: "orders" },
     {$set:  { $inc: { score: 1 } }},
      {upsert: true}
);


db.incrementseqs.findOneAndUpdate(
            { table_slug: "orders" },
            {  
                  $set: {
                        field_slug: "orders_id",
                        min_value: 1,
                        max_value: 999999999
                  },
                  $inc: { increment_by: 1 },
            },
            {upsert: true}
)


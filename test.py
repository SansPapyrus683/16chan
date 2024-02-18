def add_item(name, quantity, inventory):
    inventory[name] = inventory.get(name, 0) + quantity
    return inventory

empty = {}
order1 = add_item("apples", 10, empty)
print(empty)
order2 = add_item("bananas", 5, empty)
print(empty)
order3 = add_item("apples", 3, {"apples": 4})

print(order1)
print(order2)
print(order3)

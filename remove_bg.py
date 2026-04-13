from PIL import Image

def remove_background(input_path, output_path, threshold=220):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Successfully removed background")
    except Exception as e:
        print(f"Error: {e}")

remove_background("C:\\Users\\Abel\\Desktop\\eva\\eva-app\\assets\\images\\icon.png", "C:\\Users\\Abel\\Desktop\\eva\\eva-app\\assets\\logo.png")

import requests
import json
import time

def get_model_info(model_id, api_token):
    """
    Lấy thông tin model từ Sketchfab Data API dựa trên model ID.

    Args:
        model_id (str): ID của model.
        api_token (str): Sketchfab API token.

    Returns:
        dict: Thông tin model hoặc None nếu có lỗi.
    """
    url = f"https://api.sketchfab.com/v3/models/{model_id}"
    headers = {"Authorization": f"Token {api_token}"}
    response = None # Khởi tạo response

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Báo lỗi nếu request không thành công

        data = response.json()

        model_info = {
            "title": data["name"],
            "author": data["user"]["displayName"],
            "url": data["viewerUrl"],  # Thay embedUrl bằng viewerUrl
            "authorUrl": data["user"]["profileUrl"],
            "sketchfabUrl": "https://sketchfab.com",
            "downloadLink": None  # Mặc định không có link download
        }

        # Lấy link download (nếu có)
        for format in data.get("download", []):
            # Ưu tiên định dạng glb
            if format["format"] == "glb":
                model_info["downloadLink"] = format["url"]
                break  # Thoát vòng lặp khi tìm thấy glb
            # Nếu không có glb, lấy link đầu tiên
            elif model_info["downloadLink"] is None:
                model_info["downloadLink"] = format["url"]

        return model_info
    except requests.exceptions.RequestException as e:
        print(f"Lỗi khi lấy thông tin model {model_id}: {e}")
        if response:
            print(f"Status code: {response.status_code}, Response: {response.text}")
        return None

def process_model_urls(json_file, api_token, output_file="model_info.json"):
    """
    Đọc file JSON chứa các URL, lấy thông tin chi tiết qua API và lưu vào file mới.
    Xử lý rate limit bằng cách lưu file JSON khi gặp lỗi.

    Args:
        json_file (str): Đường dẫn đến file JSON chứa danh sách các URL.
        api_token (str): Sketchfab API token.
        output_file (str): Tên file để lưu thông tin model.
    """
    try:
        with open(json_file, "r") as f:
            model_urls = json.load(f)
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file {json_file}")
        return
    except json.JSONDecodeError:
        print(f"Lỗi: File {json_file} không đúng định dạng JSON.")
        return

    model_info_list = []
    processed_count = 0  # Đếm số model đã xử lý

    for i, url in enumerate(model_urls):
        model_id = url.split('-')[-1]
        print(f"Đang lấy thông tin cho model: {url} (ID: {model_id})")
        print(f"Đã xử lý được {processed_count}/{len(model_urls)} models.")
        try:
            model_info = get_model_info(model_id, api_token)

            if model_info:
                model_info_list.append(model_info)
                processed_count += 1
            else:
                print(f"Không thể lấy thông tin cho model: {url}")

            time.sleep(0.1)  # Tránh rate limit
        except requests.exceptions.RequestException as e:
            print(f"Gặp lỗi trong quá trình xử lý: {e}")
            print(f"Đã xử lý được {processed_count}/{len(model_urls)} models.")
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(model_info_list, f, indent=4, ensure_ascii=False)
            print(f"Đã lưu thông tin (tính đến model hiện tại) vào file {output_file}")
            return # Dừng luôn khi gặp lỗi

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(model_info_list, f, indent=4, ensure_ascii=False)
    print(f"Đã lưu thông tin vào file {output_file}")

# Thay thế bằng API token của bạn
api_token = "871230499397425b93ba976d96d76a8d"
# Thay thế bằng đường dẫn đến file JSON chứa các URL
json_file = "featured_models.json"

process_model_urls(json_file, api_token)